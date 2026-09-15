export type IdentityPreference = 'name' | 'username';
export type InstitutionalEmailStatus =
  | 'not_added'
  | 'pending'
  | 'verified'
  | 'rejected';

export interface Profile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  career: string | null;
  faculty: string | null;
  regional_center: string | null;
  province_id: string | null;
  district_id: string | null;
  identity_preference: IdentityPreference;
  institutional_email: string | null;
  institutional_email_status: InstitutionalEmailStatus;
  institutional_verified_at: string | null;
  show_location: boolean;
  profile_visible: boolean;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = Pick<
  Profile,
  | 'first_name'
  | 'last_name'
  | 'username'
  | 'bio'
  | 'career'
  | 'faculty'
  | 'regional_center'
  | 'identity_preference'
  | 'show_location'
>;

export type ProfileFormData = ProfileUpdate;
