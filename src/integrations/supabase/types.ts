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
      admin_whitelist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      blocked_slots: {
        Row: {
          blocked_date: string
          blocked_time: string | null
          created_at: string
          created_by: string | null
          id: string
          reason: string | null
          vehicle_id: string | null
        }
        Insert: {
          blocked_date: string
          blocked_time?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          vehicle_id?: string | null
        }
        Update: {
          blocked_date?: string
          blocked_time?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_slots_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          adults: number
          created_at: string
          customer_city: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          customer_state: string | null
          customer_whatsapp: string | null
          duration_hours: number
          expires_at: string | null
          id: string
          installments: number | null
          invoice_slug: string | null
          kids: number
          notes: string | null
          order_nsu: string
          paid_amount: number | null
          paid_at: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          price_per_hour_cents: number | null
          quantity: number
          receipt_url: string | null
          reservation_date: string
          reservation_time: string
          total_price: number
          tour_name: string
          tour_slug: string
          transaction_nsu: string | null
          updated_at: string
          vehicle: string
          vehicle_id: string | null
        }
        Insert: {
          adults?: number
          created_at?: string
          customer_city?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          customer_state?: string | null
          customer_whatsapp?: string | null
          duration_hours?: number
          expires_at?: string | null
          id?: string
          installments?: number | null
          invoice_slug?: string | null
          kids?: number
          notes?: string | null
          order_nsu: string
          paid_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price_per_hour_cents?: number | null
          quantity: number
          receipt_url?: string | null
          reservation_date: string
          reservation_time: string
          total_price: number
          tour_name: string
          tour_slug: string
          transaction_nsu?: string | null
          updated_at?: string
          vehicle?: string
          vehicle_id?: string | null
        }
        Update: {
          adults?: number
          created_at?: string
          customer_city?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          customer_state?: string | null
          customer_whatsapp?: string | null
          duration_hours?: number
          expires_at?: string | null
          id?: string
          installments?: number | null
          invoice_slug?: string | null
          kids?: number
          notes?: string | null
          order_nsu?: string
          paid_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price_per_hour_cents?: number | null
          quantity?: number
          receipt_url?: string | null
          reservation_date?: string
          reservation_time?: string
          total_price?: number
          tour_name?: string
          tour_slug?: string
          transaction_nsu?: string | null
          updated_at?: string
          vehicle?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string | null
          business_hours: string | null
          cancellation_policy: string | null
          company_name: string | null
          email: string | null
          email_message: string | null
          facebook: string | null
          id: number
          instagram: string | null
          logo_url: string | null
          phone: string | null
          updated_at: string
          voucher_message: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          business_hours?: string | null
          cancellation_policy?: string | null
          company_name?: string | null
          email?: string | null
          email_message?: string | null
          facebook?: string | null
          id?: number
          instagram?: string | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          voucher_message?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          business_hours?: string | null
          cancellation_policy?: string | null
          company_name?: string | null
          email?: string | null
          email_message?: string | null
          facebook?: string | null
          id?: number
          instagram?: string | null
          logo_url?: string | null
          phone?: string | null
          updated_at?: string
          voucher_message?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          active: boolean
          created_at: string
          id: string
          sort_order: number
          time: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          sort_order?: number
          time: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          sort_order?: number
          time?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          available_quantity: number
          capacity: number
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_cents: number
          slug: string
          sort_order: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          available_quantity?: number
          capacity: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_cents?: number
          slug: string
          sort_order?: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          available_quantity?: number
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          slug?: string
          sort_order?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin_if_whitelisted: { Args: never; Returns: boolean }
      expire_pending_reservations: { Args: never; Returns: undefined }
      get_fully_booked_dates: {
        Args: { p_from: string; p_to: string; p_vehicle_id: string }
        Returns: {
          reservation_date: string
        }[]
      }
      get_taken_times: {
        Args: { p_date: string; p_vehicle_id: string }
        Returns: {
          reservation_time: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      payment_status:
        | "PENDING_PAYMENT"
        | "PAID"
        | "FAILED"
        | "CANCELLED"
        | "COMPLETED"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin"],
      payment_status: [
        "PENDING_PAYMENT",
        "PAID",
        "FAILED",
        "CANCELLED",
        "COMPLETED",
      ],
    },
  },
} as const
