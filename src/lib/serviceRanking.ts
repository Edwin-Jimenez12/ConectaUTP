import type { PublicService } from '../types/service';

export function comparePublicServices(a: PublicService, b: PublicService) {
  return Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured))
    || Number(Boolean(b.is_interest_featured)) - Number(Boolean(a.is_interest_featured))
    || (b.featured_priority ?? 0) - (a.featured_priority ?? 0)
    || Number(Boolean(b.priority_results_enabled)) - Number(Boolean(a.priority_results_enabled))
    || Number(Boolean(b.profile_boost_enabled)) - Number(Boolean(a.profile_boost_enabled))
    || (b.interest_score ?? 0) - (a.interest_score ?? 0)
    || b.created_at.localeCompare(a.created_at);
}

export function hasVisibleHighlight(service: PublicService) {
  return Boolean(service.is_featured || service.is_interest_featured);
}
