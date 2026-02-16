export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plats: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          image: string | null;
          available: boolean;
          category_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          image?: string | null;
          available?: boolean;
          category_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          image?: string | null;
          available?: boolean;
          category_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plats_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      option_types: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      options: {
        Row: {
          id: string;
          name: string;
          price_modifier: number | null;
          option_type_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price_modifier?: number | null;
          option_type_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price_modifier?: number | null;
          option_type_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "options_option_type_id_fkey";
            columns: ["option_type_id"];
            isOneToOne: false;
            referencedRelation: "option_types";
            referencedColumns: ["id"];
          },
        ];
      };
      plat_options: {
        Row: {
          plat_id: string;
          option_id: string;
        };
        Insert: {
          plat_id: string;
          option_id: string;
        };
        Update: {
          plat_id?: string;
          option_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plat_options_plat_id_fkey";
            columns: ["plat_id"];
            isOneToOne: false;
            referencedRelation: "plats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plat_options_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "options";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_profiles: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      site_config: {
        Row: {
          id: string;
          key: string;
          value: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"];

export type Plat = Database["public"]["Tables"]["plats"]["Row"];
export type PlatInsert = Database["public"]["Tables"]["plats"]["Insert"];
export type PlatUpdate = Database["public"]["Tables"]["plats"]["Update"];

export type OptionType = Database["public"]["Tables"]["option_types"]["Row"];
export type OptionTypeInsert =
  Database["public"]["Tables"]["option_types"]["Insert"];
export type OptionTypeUpdate =
  Database["public"]["Tables"]["option_types"]["Update"];

export type Option = Database["public"]["Tables"]["options"]["Row"];
export type OptionInsert = Database["public"]["Tables"]["options"]["Insert"];
export type OptionUpdate = Database["public"]["Tables"]["options"]["Update"];

export type PlatOption = Database["public"]["Tables"]["plat_options"]["Row"];
export type PlatOptionInsert =
  Database["public"]["Tables"]["plat_options"]["Insert"];

export type AdminProfile =
  Database["public"]["Tables"]["admin_profiles"]["Row"];
export type SiteConfig = Database["public"]["Tables"]["site_config"]["Row"];
export type SiteConfigInsert =
  Database["public"]["Tables"]["site_config"]["Insert"];
export type SiteConfigUpdate =
  Database["public"]["Tables"]["site_config"]["Update"];

// Extended types with relations
export type PlatWithCategory = Plat & {
  categories: Category;
};

export type PlatWithOptions = Plat & {
  plat_options: (PlatOption & {
    options: Option & {
      option_types: OptionType;
    };
  })[];
};

export type OptionWithType = Option & {
  option_types: OptionType;
};
