"use client";

import { useEffect, useState } from "react";
import { useListStore } from "@/stores/listStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ListDetailPanel() {
  const { activeList, items, loading, fetchItems, addItem, deleteItem } =
    useListStore();
  const [newItem, setNewItem] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (activeList?.id) fetchItems(activeList.id);
  }, [activeList?.id]);

  if (!activeList) return null;

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await addItem(newItem.trim(), activeList.id);
    setNewItem("");
  };

  const handleShare = () => {
    const text =
      `${activeList.name}\n\n` +
      items.map((i) => `• ${i.item_name}`).join("\n") +
      "\n\nShared via Vopari";
    navigator.clipboard.writeText(text);
    toast.success("List copied to clipboard");
  };

  return (
    <div className="border rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">{activeList.name}</h2>
        <div className="flex gap-2">
          <Badge variant="secondary">{items.length} items</Badge>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            Share
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item..."
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Add
        </Button>
      </div>
      <Separator className="mb-3" />
      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No items yet</p>
      )}
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-lg group"
          >
            <span className="text-sm">{item.item_name}</span>
            <button
              onClick={() => deleteItem(item.id)}
              className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      {items.length > 0 && (
        <Button
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => router.push("/dashboard/upload")}
        >
          Upload a flyer to compare prices →
        </Button>
      )}
    </div>
  );
}
