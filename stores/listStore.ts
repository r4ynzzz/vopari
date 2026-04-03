import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { GroceryList, ListItem } from "@/types";

interface ListState {
  lists: GroceryList[];
  activeList: GroceryList | null;
  items: ListItem[];
  loading: boolean;
  fetchLists: (userId: string) => Promise<void>;
  fetchItems: (listId: string) => Promise<void>;
  addList: (name: string, userId: string) => Promise<void>;
  addItem: (name: string, listId: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  setActiveList: (list: GroceryList | null) => void;
}

export const useListStore = create<ListState>()((set) => ({
  lists: [],
  activeList: null,
  items: [],
  loading: false,

  fetchLists: async (userId) => {
    set({ loading: true });
    const supabase = createClient();
    const { data } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    set({ lists: data ?? [], loading: false });
  },

  fetchItems: async (listId) => {
    set({ loading: true });
    const supabase = createClient();
    const { data } = await supabase
      .from("list_items")
      .select("*")
      .eq("list_id", listId)
      .order("created_at", { ascending: true });
    set({ items: data ?? [], loading: false });
  },

  addList: async (name, userId) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("grocery_lists")
      .insert({ name, user_id: userId })
      .select()
      .single();
    if (data) set((s) => ({ lists: [data, ...s.lists] }));
  },

  addItem: async (name, listId) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("list_items")
      .insert({ item_name: name, list_id: listId })
      .select()
      .single();
    if (data) set((s) => ({ items: [...s.items, data] }));
  },

  deleteItem: async (id) => {
    const supabase = createClient();
    await supabase.from("list_items").delete().eq("id", id);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },

  deleteList: async (id) => {
    const supabase = createClient();
    await supabase.from("grocery_lists").delete().eq("id", id);
    set((s) => ({
      lists: s.lists.filter((l) => l.id !== id),
      activeList: null,
    }));
  },

  setActiveList: (list) => set({ activeList: list }),
}));
