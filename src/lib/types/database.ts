/**
 * Hand-written types mirroring supabase/migrations/0001_init.sql and
 * 0002_content_and_media.sql, in the same shape `supabase gen types
 * typescript` produces. Keep in sync with the SQL schema; regenerate
 * manually if columns change.
 */

export type PrayerRequestStatus = "pending" | "answered";
export type TestimonialStatus = "pending" | "approved" | "rejected";
export type VideoSourceType = "recorded" | "uploaded";

export type PrayerRequestRow = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  request: string;
  is_public: boolean;
  status: PrayerRequestStatus;
};

export type PrayerRequestInsert = Pick<
  PrayerRequestRow,
  "full_name" | "email" | "request" | "is_public"
>;

export type TestimonialRow = {
  id: string;
  created_at: string;
  name: string;
  testimony_date: string;
  category: string;
  content: string;
  status: TestimonialStatus;
};

export type TestimonialInsert = Omit<TestimonialRow, "id" | "created_at" | "status"> &
  Partial<Pick<TestimonialRow, "status">>;

export type SiteContentRow = {
  key: string;
  value: string;
  updated_at: string;
};

export type VideoMessageRow = {
  id: string;
  created_at: string;
  video_url: string;
  source_type: VideoSourceType;
  caption: string;
  is_active: boolean;
};

export type VideoMessageInsert = Pick<
  VideoMessageRow,
  "video_url" | "source_type" | "caption"
> &
  Partial<Pick<VideoMessageRow, "is_active">>;

export type AnnouncementRow = {
  id: string;
  created_at: string;
  title: string;
  body: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
};

export type AnnouncementInsert = Pick<AnnouncementRow, "title"> &
  Partial<Pick<AnnouncementRow, "body" | "image_url" | "is_active" | "display_order">>;

export type DonationTierRow = {
  id: string;
  created_at: string;
  label: string;
  amount: number;
  description: string;
  is_active: boolean;
  display_order: number;
};

export type DonationTierInsert = Pick<DonationTierRow, "label" | "amount"> &
  Partial<Pick<DonationTierRow, "description" | "is_active" | "display_order">>;

export type VideoCategoryRow = {
  id: string;
  created_at: string;
  label: string;
  display_order: number;
};

export type VideoCategoryInsert = Pick<VideoCategoryRow, "label"> &
  Partial<Pick<VideoCategoryRow, "display_order">>;

export type VideoCategoryAssignmentRow = {
  video_id: string;
  category_id: string;
  created_at: string;
};

export type VideoCategoryAssignmentInsert = Pick<
  VideoCategoryAssignmentRow,
  "video_id" | "category_id"
>;

export type ProductRow = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  category: string;
  price: number;
  cover_image_url: string | null;
  file_path: string;
  is_active: boolean;
  display_order: number;
};

export type ProductInsert = Pick<ProductRow, "title" | "category" | "price" | "file_path"> &
  Partial<Pick<ProductRow, "description" | "cover_image_url" | "is_active" | "display_order">>;

export type ProductOrderStatus = "pending" | "fulfilled";

export type ProductOrderRow = {
  id: string;
  created_at: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: ProductOrderStatus;
  paypal_order_id: string | null;
};

export type ProductOrderInsert = Pick<
  ProductOrderRow,
  "product_id" | "customer_name" | "customer_email" | "amount"
>;

// NOTE: this must be a `type`, not an `interface`. supabase-js's generics
// check `Database[Schema] extends GenericSchema` (which requires an index
// signature on Tables/Views/Functions); a named `interface` never
// structurally satisfies that check even when its shape matches, so the
// client silently degrades to untyped `never` queries.
export type Database = {
  public: {
    Tables: {
      prayer_requests: {
        Row: PrayerRequestRow;
        Insert: PrayerRequestInsert;
        Update: Partial<Pick<PrayerRequestRow, "status">>;
        Relationships: [];
      };
      testimonials: {
        Row: TestimonialRow;
        Insert: TestimonialInsert;
        Update: Partial<TestimonialRow>;
        Relationships: [];
      };
      site_content: {
        Row: SiteContentRow;
        Insert: Pick<SiteContentRow, "key" | "value">;
        Update: Partial<Pick<SiteContentRow, "value">>;
        Relationships: [];
      };
      video_messages: {
        Row: VideoMessageRow;
        Insert: VideoMessageInsert;
        Update: Partial<Pick<VideoMessageRow, "is_active">>;
        Relationships: [];
      };
      announcements: {
        Row: AnnouncementRow;
        Insert: AnnouncementInsert;
        Update: Partial<
          Pick<AnnouncementRow, "title" | "body" | "image_url" | "is_active" | "display_order">
        >;
        Relationships: [];
      };
      donation_tiers: {
        Row: DonationTierRow;
        Insert: DonationTierInsert;
        Update: Partial<
          Pick<DonationTierRow, "label" | "amount" | "description" | "is_active" | "display_order">
        >;
        Relationships: [];
      };
      video_categories: {
        Row: VideoCategoryRow;
        Insert: VideoCategoryInsert;
        Update: Partial<Pick<VideoCategoryRow, "label" | "display_order">>;
        Relationships: [];
      };
      video_category_assignments: {
        Row: VideoCategoryAssignmentRow;
        Insert: VideoCategoryAssignmentInsert;
        Update: Partial<VideoCategoryAssignmentRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: Partial<
          Pick<
            ProductRow,
            | "title"
            | "description"
            | "category"
            | "price"
            | "cover_image_url"
            | "file_path"
            | "is_active"
            | "display_order"
          >
        >;
        Relationships: [];
      };
      product_orders: {
        Row: ProductOrderRow;
        Insert: ProductOrderInsert;
        Update: Partial<Pick<ProductOrderRow, "status" | "paypal_order_id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
