export interface ModelSources {
  huggingface: string | null;
  ollama: string | null;
  openrouter: string | null;
}

export interface ModelPricing {
  prompt: string;
  completion: string;
}

export interface ModelItem {
  id: string;
  display_name: string;
  source: string;
  sources: ModelSources;
  author: string;
  model_family: string;
  model_size: string;
  quantization: string;
  license: string;
  downloads: number;
  likes: number;
  last_modified: string | null;
  first_seen_at: string;
  last_seen_at: string;
  has_gguf: boolean;
  has_ollama: boolean;
  context_length: number | null;
  pricing: ModelPricing | null;
  description: string | null;
  use_cases: string[];
  tags: string[];
  radar_score: number;
  is_new: boolean;
  is_rising: boolean;
  collected_at: string;
}

export interface FamilyTrendItem {
  family: string;
  model_count: number;
  new_model_count: number;
  rising_model_count: number;
  total_downloads: number;
  total_likes: number;
  avg_radar_score: number;
}

export interface SummaryData {
  total_models: number;
  total_downloads: number;
  total_likes: number;
  top_rising_models: ModelItem[];
  top_new_models: ModelItem[];
  top_radar_models: ModelItem[];
}

export interface MetadataData {
  collected_at: string;
  data_version: string;
  total_count: number;
  sources: {
    name: string;
    status: string;
    count: number;
  }[];
}
