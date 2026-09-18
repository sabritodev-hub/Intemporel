export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          order: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      creneaux: {
        Row: {
          capacite: number
          created_at: string
          debut: string
          fin: string
          id: string
          modele_id: string | null
          motif_annulation: string | null
          service: string
          statut: Database["public"]["Enums"]["statut_creneau"]
          updated_at: string
        }
        Insert: {
          capacite: number
          created_at?: string
          debut: string
          fin: string
          id?: string
          modele_id?: string | null
          motif_annulation?: string | null
          service?: string
          statut?: Database["public"]["Enums"]["statut_creneau"]
          updated_at?: string
        }
        Update: {
          capacite?: number
          created_at?: string
          debut?: string
          fin?: string
          id?: string
          modele_id?: string | null
          motif_annulation?: string | null
          service?: string
          statut?: Database["public"]["Enums"]["statut_creneau"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creneaux_modele_id_fkey"
            columns: ["modele_id"]
            isOneToOne: false
            referencedRelation: "modeles_creneaux"
            referencedColumns: ["id"]
          },
        ]
      }
      modeles_creneaux: {
        Row: {
          actif: boolean
          capacite: number
          created_at: string
          heure_debut: string
          heure_fin: string
          id: string
          jour_semaine: number
          service: string
          updated_at: string
        }
        Insert: {
          actif?: boolean
          capacite: number
          created_at?: string
          heure_debut: string
          heure_fin: string
          id?: string
          jour_semaine: number
          service?: string
          updated_at?: string
        }
        Update: {
          actif?: boolean
          capacite?: number
          created_at?: string
          heure_debut?: string
          heure_fin?: string
          id?: string
          jour_semaine?: number
          service?: string
          updated_at?: string
        }
        Relationships: []
      }
      option_types: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      options: {
        Row: {
          created_at: string
          id: string
          name: string
          option_type_id: string
          price_modifier: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          option_type_id: string
          price_modifier?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          option_type_id?: string
          price_modifier?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_option_type_id_fkey"
            columns: ["option_type_id"]
            isOneToOne: false
            referencedRelation: "option_types"
            referencedColumns: ["id"]
          },
        ]
      }
      plat_options: {
        Row: {
          option_id: string
          plat_id: string
        }
        Insert: {
          option_id: string
          plat_id: string
        }
        Update: {
          option_id?: string
          plat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plat_options_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plat_options_plat_id_fkey"
            columns: ["plat_id"]
            isOneToOne: false
            referencedRelation: "plats"
            referencedColumns: ["id"]
          },
        ]
      }
      plats: {
        Row: {
          available: boolean | null
          category_id: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          price: number
          slug: string
          updated_at: string
        }
        Insert: {
          available?: boolean | null
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          price: number
          slug: string
          updated_at?: string
        }
        Update: {
          available?: boolean | null
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plats_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_tentatives: {
        Row: {
          creee_le: string
          id: number
          ip_hash: string
        }
        Insert: {
          creee_le?: string
          id?: number
          ip_hash: string
        }
        Update: {
          creee_le?: string
          id?: number
          ip_hash?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          annule_at: string | null
          anonymise_at: string | null
          consentement_at: string | null
          couverts: number
          created_at: string
          creneau_id: string
          email: string | null
          id: string
          nom: string | null
          reference: string
          source: string
          statut: Database["public"]["Enums"]["statut_resa"]
          telephone: string | null
          token_annulation_hash: string | null
          updated_at: string
        }
        Insert: {
          annule_at?: string | null
          anonymise_at?: string | null
          consentement_at?: string | null
          couverts: number
          created_at?: string
          creneau_id: string
          email?: string | null
          id?: string
          nom?: string | null
          reference: string
          source?: string
          statut?: Database["public"]["Enums"]["statut_resa"]
          telephone?: string | null
          token_annulation_hash?: string | null
          updated_at?: string
        }
        Update: {
          annule_at?: string | null
          anonymise_at?: string | null
          consentement_at?: string | null
          couverts?: number
          created_at?: string
          creneau_id?: string
          email?: string | null
          id?: string
          nom?: string | null
          reference?: string
          source?: string
          statut?: Database["public"]["Enums"]["statut_resa"]
          telephone?: string | null
          token_annulation_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_creneau_id_fkey"
            columns: ["creneau_id"]
            isOneToOne: false
            referencedRelation: "creneaux"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_creneau_id_fkey"
            columns: ["creneau_id"]
            isOneToOne: false
            referencedRelation: "creneaux_publics"
            referencedColumns: ["id"]
          },
        ]
      }
      site_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      creneaux_publics: {
        Row: {
          capacite: number | null
          couverts_reserves: number | null
          debut: string | null
          fin: string | null
          id: string | null
          jour: string | null
          journee_close: boolean | null
          places_restantes: number | null
          reservable: boolean | null
          service: string | null
          statut: Database["public"]["Enums"]["statut_creneau"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      annuler_creneau: {
        Args: { p_creneau_id: string; p_motif: string }
        Returns: {
          couverts: number
          email: string
          id: string
          nom: string
          reference: string
          telephone: string
        }[]
      }
      annuler_par_token: {
        Args: { p_token_hash: string }
        Returns: {
          couverts: number
          debut: string
          email: string
          fin: string
          id: string
          nom: string
          reference: string
        }[]
      }
      consulter_par_token: {
        Args: { p_token_hash: string }
        Returns: {
          annulable: boolean
          annule_at: string
          couverts: number
          debut: string
          fin: string
          reference: string
          statut: Database["public"]["Enums"]["statut_resa"]
        }[]
      }
      generer_creneaux: { Args: { p_mois: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      modifier_capacite: {
        Args: { p_capacite: number; p_creneau_id: string }
        Returns: number
      }
      reserver: {
        Args: {
          p_couverts: number
          p_creneau_id: string
          p_email: string
          p_nom: string
          p_reference: string
          p_telephone: string
          p_token_hash: string
        }
        Returns: string
      }
    }
    Enums: {
      statut_creneau: "ouvert" | "ferme" | "annule"
      statut_resa:
        | "confirmee"
        | "venue"
        | "absent"
        | "annulee_client"
        | "annulee_restaurant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      statut_creneau: ["ouvert", "ferme", "annule"],
      statut_resa: [
        "confirmee",
        "venue",
        "absent",
        "annulee_client",
        "annulee_restaurant",
      ],
    },
  },
} as const

// ==================== Helper types ====================
// Alias pratiques par table, dans le style du fichier généré avant l'ajout
// du module de réservation. Conservés pour ne pas casser les composants
// existants (menu public, admin plats/catégories/options) qui les importent
// directement depuis "@/types/database.types".

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

// ==================== Module réservation ====================

export type ModeleCreneau =
  Database["public"]["Tables"]["modeles_creneaux"]["Row"];
export type ModeleCreneauInsert =
  Database["public"]["Tables"]["modeles_creneaux"]["Insert"];
export type ModeleCreneauUpdate =
  Database["public"]["Tables"]["modeles_creneaux"]["Update"];

export type Creneau = Database["public"]["Tables"]["creneaux"]["Row"];
export type CreneauInsert = Database["public"]["Tables"]["creneaux"]["Insert"];
export type CreneauUpdate = Database["public"]["Tables"]["creneaux"]["Update"];

export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
export type ReservationInsert =
  Database["public"]["Tables"]["reservations"]["Insert"];
export type ReservationUpdate =
  Database["public"]["Tables"]["reservations"]["Update"];

export type CreneauPublic = Database["public"]["Views"]["creneaux_publics"]["Row"];
