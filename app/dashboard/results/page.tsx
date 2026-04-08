"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { GroceryList } from "@/types";

interface MatchResult {
  listItem: { id: string; item_name: string };
  cheapest: {
    id: string;
    item_name: string;
    price: number;
    currency: string;
    store_name: string;
    confidence: number;
  } | null;
  matches: Array<{
    id: string;
    item_name: string;
    price: number;
    currency: string;
    store_name: string;
    confidence: number;
  }>;
}

interface Summary {
  totalItems: number;
  matchedItems: number;
  unmatchedItems: number;
  potentialSaving: number;
}

export default function ResultsPage() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) return;
        createClient()
          .from("grocery_lists")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .then(({ data }) => {
            setLists(data ?? []);
            if (data?.[0]) setSelectedListId(data[0].id);
          });
      });
  }, []);

  const handleCompare = async () => {
    if (!selectedListId) {
      toast.error("Please select a list first");
      return;
    }
    setLoading(true);
    setResults([]);
    setSummary(null);
    setHasCompared(false);
    setExpandedItems(new Set());

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: selectedListId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Comparison failed");
        return;
      }

      setResults(data.results);
      setSummary(data.summary);
      setHasCompared(true);
      toast.success(
        `Found prices for ${data.summary.matchedItems} of ${data.summary.totalItems} items`,
      );
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedListName =
    lists.find((l) => l.id === selectedListId)?.name ?? "";

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-2">Price comparison</h1>
      <p className="text-sm text-gray-500 mb-6">
        Select a list and compare it against your uploaded flyers
      </p>

      {/* List selector + compare button */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={selectedListId}
          onChange={(e) => {
            setSelectedListId(e.target.value);
            setHasCompared(false);
            setResults([]);
            setSummary(null);
          }}
          className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="" disabled>
            Select a list
          </option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <Button
          onClick={handleCompare}
          disabled={!selectedListId || loading}
          className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
        >
          {loading ? "Comparing..." : "Compare prices"}
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16 text-gray-400 text-sm animate-pulse">
          Matching your items against uploaded flyers...
        </div>
      )}

      {/* Empty state — no flyers uploaded */}
      {!loading && hasCompared && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm mb-3">No flyers uploaded yet</p>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard/upload")}
          >
            Upload a flyer
          </Button>
        </div>
      )}

      {/* Summary cards */}
      {summary && !loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-gray-800">
              {summary.totalItems}
            </p>
            <p className="text-xs text-gray-500 mt-1">Items in list</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-emerald-700">
              {summary.matchedItems}
            </p>
            <p className="text-xs text-emerald-600 mt-1">Prices found</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold text-blue-700">
              R{summary.potentialSaving.toFixed(2)}
            </p>
            <p className="text-xs text-blue-600 mt-1">Potential saving</p>
          </div>
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && !loading && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {selectedListName}
          </h2>

          {results.map(({ listItem, cheapest, matches }) => {
            const isExpanded = expandedItems.has(listItem.id);
            const hasMatches = matches.length > 0;
            const hasAlternatives = matches.length > 1;

            return (
              <Card
                key={listItem.id}
                className={!hasMatches ? "opacity-60" : ""}
              >
                <CardContent className="p-0">
                  {/* List item header */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-sm truncate">
                        {listItem.item_name}
                      </span>
                    </div>
                    {!hasMatches && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        Not found
                      </Badge>
                    )}
                  </div>

                  {/* Cheapest match — always shown if exists */}
                  {cheapest && (
                    <div className="mx-3 mb-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-emerald-800 truncate">
                            {cheapest.item_name}
                          </p>
                          <p className="text-xs text-emerald-600 mt-0.5">
                            {cheapest.store_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Cheapest
                          </span>
                          <span className="font-semibold text-emerald-700">
                            R{cheapest.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Show alternatives toggle */}
                      {hasAlternatives && (
                        <button
                          onClick={() => toggleExpand(listItem.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 mt-2 ml-1 flex items-center gap-1"
                        >
                          {isExpanded
                            ? `Hide alternatives`
                            : `See ${matches.length - 1} more option${matches.length > 2 ? "s" : ""}`}
                          <span>{isExpanded ? "▲" : "▼"}</span>
                        </button>
                      )}

                      {/* Alternative matches */}
                      {isExpanded && (
                        <div className="mt-2 space-y-1">
                          {matches.slice(1).map((match) => (
                            <div
                              key={match.id}
                              className="bg-gray-50 rounded-lg px-4 py-2.5 flex items-center justify-between"
                            >
                              <div className="min-w-0">
                                <p className="text-sm text-gray-700 truncate">
                                  {match.item_name}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {match.store_name}
                                </p>
                              </div>
                              <span className="font-medium text-gray-600 text-sm shrink-0 ml-3">
                                R{match.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Not found section */}
          {summary && summary.unmatchedItems > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">
                {summary.unmatchedItems} item
                {summary.unmatchedItems > 1 ? "s" : ""} not found in any flyer
              </p>
              <div className="space-y-1">
                {results
                  .filter((r) => !r.cheapest)
                  .map(({ listItem }) => (
                    <div
                      key={listItem.id}
                      className="text-sm text-gray-400 px-3 py-2 bg-gray-50 rounded-lg"
                    >
                      {listItem.item_name}
                    </div>
                  ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Upload more flyers to find these items
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
