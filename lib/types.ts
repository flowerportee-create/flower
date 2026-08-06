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
  purpose: string;
  arrangement: string;
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

export type PaymentStatus = 'pending' | 'paid' | 'canceled';

export type Participant = {
  id: string;
  project_id: string;
  name: string;
  amount: number;
  message: string;
  include_in_tag: boolean;
  is_anonymous: boolean;
  payment_status: PaymentStatus;
  payment_token: string;
  square_payment_link_id: string | null;
  square_order_id: string | null;
  square_payment_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export type FlowerSample = {
  id: string;
  purpose: string;
  color_key: string;
  arrangement: string;
  storage_path: string;
  public_url: string;
  caption: string;
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

export type ParticipantInsert = Omit<
  Participant,
  | 'id'
  | 'created_at'
  | 'payment_token'
  | 'square_payment_link_id'
  | 'square_order_id'
  | 'square_payment_id'
  | 'paid_at'
> &
  Partial<
    Pick<
      Participant,
      | 'payment_token'
      | 'square_payment_link_id'
      | 'square_order_id'
      | 'square_payment_id'
      | 'paid_at'
    >
  >;

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
      flower_samples: {
        Row: FlowerSample;
        Insert: Omit<FlowerSample, 'id' | 'created_at'>;
        Update: Partial<FlowerSample>;
        Relationships: [];
      };
    };
    Views: Empty;
    Functions: Empty;
    Enums: Empty;
    CompositeTypes: Empty;
  };
}
