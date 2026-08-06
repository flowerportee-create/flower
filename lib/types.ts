export type ProjectStatus = 'open' | 'closed';

export type ProductionStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'delivered';

export type UserRole = 'organizer' | 'florist';

export type Profile = {
  id: string;
  display_name: string;
  role: UserRole;
  created_at: string;
}

export type Project = {
  id: string;
  organizer_id: string;
  share_token: string;
  report_token: string;
  title: string;
  recipient_name: string;
  delivery_address: string;
  delivery_date: string;
  entry_deadline: string;
  target_amount: number;
  unit_amount: number;
  flower_type: string;
  color_preference: string;
  tag_name: string;
  message: string;
  note: string;
  status: ProjectStatus;
  production_status: ProductionStatus;
  florist_comment: string;
  completed_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type Participant = {
  id: string;
  project_id: string;
  name: string;
  amount: number;
  message: string;
  include_in_tag: boolean;
  is_anonymous: boolean;
  created_at: string;
}

export type ProjectPhoto = {
  id: string;
  project_id: string;
  storage_path: string;
  public_url: string;
  created_at: string;
}

export type ProjectInsert = Omit<
  Project,
  'id' | 'share_token' | 'report_token' | 'created_at' | 'updated_at'
> &
  Partial<Pick<Project, 'share_token' | 'report_token'>>;

export type ParticipantInsert = Omit<Participant, 'id' | 'created_at'>;

export interface ActionResult {
  error: string | null;
}

export interface FormState {
  error: string | null;
}

export interface JoinState {
  error: string | null;
  success: boolean;
}

type Empty = { [_ in never]: never };

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: Partial<Project>;
        Relationships: [];
      };
      participants: {
        Row: Participant;
        Insert: ParticipantInsert;
        Update: Partial<Participant>;
        Relationships: [];
      };
      project_photos: {
        Row: ProjectPhoto;
        Insert: Omit<ProjectPhoto, 'id' | 'created_at'>;
        Update: Partial<ProjectPhoto>;
        Relationships: [];
      };
    };
    Views: Empty;
    Functions: Empty;
    Enums: Empty;
    CompositeTypes: Empty;
  };
}
