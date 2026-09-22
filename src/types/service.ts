export type ServiceStatus = 'draft' | 'published';
export type ServiceModality = 'online' | 'in_person' | 'both';

export interface DatabaseService {
  id: string;
  owner_id: string;
  category_id: string;
  title: string;
  description: string;
  modality: ServiceModality;
  price: number | null;
  status: ServiceStatus;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface PublicService extends Pick<DatabaseService, 'id' | 'owner_id' | 'category_id' | 'modality' | 'price' | 'description'> {
  title: string;
  created_at: string;
  category_name: string;
  provider_name: string;
  provider_username: string | null;
  provider_avatar_url?: string | null;
  cover_image_url?: string;
  cover_image_alt?: string;
  is_featured?: boolean;
  is_plan_featured?: boolean;
  is_promoted?: boolean;
  is_interest_featured?: boolean;
  interest_score?: number;
  plan_featured_until?: string | null;
  featured_priority?: number;
  priority_results_enabled?: boolean;
  contact_clients_enabled?: boolean;
  profile_boost_enabled?: boolean;
}

export interface ServiceCardData {
  id: string;
  title: string;
  provider: string;
  price: string;
  category: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  providerImageUrl?: string | null;
  locked?: boolean;
  requestHref?: string;
}

export interface ServiceImage {
  id: string;
  service_id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
  is_cover: boolean;
}
