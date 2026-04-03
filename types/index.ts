export interface GroceryList {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  item_name: string;
  created_at: string;
}

export interface UploadedDoc {
  id: string;
  user_id: string;
  store_name: string | null;
  file_url: string | null;
  file_hash: string | null;
  doc_type: "image" | "pdf" | null;
  parsed: boolean;
  created_at: string;
}

export interface ParsedItem {
  id: string;
  doc_id: string;
  item_name: string;
  price: number;
  currency: string;
}

export interface PriceMatch {
  id: string;
  list_item_id: string;
  parsed_item_id: string;
  confidence: number;
  parsed_item?: ParsedItem;
}
