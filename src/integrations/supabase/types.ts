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
      vehicles: {
        Row: {
          available_quantity: number
          capacity: number
          created_at: string
          id: string
          name: string
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
          id?: string
          name: string
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
          id?: string
          name?: string
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
    }
    Enums: {
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
