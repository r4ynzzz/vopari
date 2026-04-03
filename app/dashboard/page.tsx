"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useListStore } from "@/stores/listStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ListDetailPanel from "@/components/list-detail-panel";
import { toast } from "sonner";
import type { GroceryList } from "@/types";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const {
    lists,
    loading,
    activeList,
    fetchLists,
    addList,
    deleteList,
    setActiveList,
  } = useListStore();

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user) {
          setUserId(user.id);
          fetchLists(user.id);
        }
      });
  }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !userId) return;
    await addList(newName.trim(), userId);
    setNewName("");
    setAdding(false);
    toast.success("List created");
  };

  const handleDelete = async (list: GroceryList) => {
    if (!confirm(`Delete "${list.name}"?`)) return;
    await deleteList(list.id);
    toast.success("List deleted");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">My lists</h1>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdding(!adding)}
          >
            + New list
          </Button>
        </div>
        {adding && (
          <div className="flex gap-2 mb-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="List name"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button
              onClick={handleAdd}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Save
            </Button>
          </div>
        )}
        {loading && <p className="text-sm text-gray-400">Loading...</p>}
        {!loading && lists.length === 0 && (
          <p className="text-sm text-gray-400 mt-8 text-center">
            No lists yet — create one above
          </p>
        )}
        <div className="space-y-2">
          {lists.map((list) => (
            <Card
              key={list.id}
              className={`cursor-pointer transition-colors hover:border-emerald-300
                ${activeList?.id === list.id ? "border-emerald-500 bg-emerald-50" : ""}`}
              onClick={() => setActiveList(list)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-medium">{list.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(list);
                  }}
                >
                  ✕
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div>
        {activeList ? (
          <ListDetailPanel />
        ) : (
          <div className="text-center text-gray-400 mt-16 text-sm">
            Select a list to view items
          </div>
        )}
      </div>
    </div>
  );
}
