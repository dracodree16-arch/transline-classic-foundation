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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booked_by: string | null
          booking_ref: string | null
          branch_id: string
          commission_amount: number
          created_at: string | null
          discount_amount: number
          fare_amount: number
          id: string
          mpesa_receipt: string | null
          passenger_name: string
          passenger_phone: string
          payment_status: string | null
          seat_number: string | null
          trip_id: string
        }
        Insert: {
          booked_by?: string | null
          booking_ref?: string | null
          branch_id: string
          commission_amount?: number
          created_at?: string | null
          discount_amount?: number
          fare_amount: number
          id?: string
          mpesa_receipt?: string | null
          passenger_name: string
          passenger_phone: string
          payment_status?: string | null
          seat_number?: string | null
          trip_id: string
        }
        Update: {
          booked_by?: string | null
          booking_ref?: string | null
          branch_id?: string
          commission_amount?: number
          created_at?: string | null
          discount_amount?: number
          fare_amount?: number
          id?: string
          mpesa_receipt?: string | null
          passenger_name?: string
          passenger_phone?: string
          payment_status?: string | null
          seat_number?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone: string | null
          town: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          town?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          town?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          branch_id: string
          category: string
          created_at: string | null
          description: string | null
          id: string
          logged_by: string | null
          spent_at: string | null
        }
        Insert: {
          amount: number
          branch_id: string
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          logged_by?: string | null
          spent_at?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          logged_by?: string | null
          spent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          access_password: string
          booked_by: string | null
          created_at: string | null
          description: string | null
          destination_branch_id: string
          fare_amount: number
          id: string
          mpesa_receipt: string | null
          origin_branch_id: string
          payment_status: string | null
          receiver_name: string
          receiver_phone: string
          sender_name: string
          sender_phone: string
          status: string | null
          tracking_code: string
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          access_password: string
          booked_by?: string | null
          created_at?: string | null
          description?: string | null
          destination_branch_id: string
          fare_amount: number
          id?: string
          mpesa_receipt?: string | null
          origin_branch_id: string
          payment_status?: string | null
          receiver_name: string
          receiver_phone: string
          sender_name: string
          sender_phone: string
          status?: string | null
          tracking_code: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          access_password?: string
          booked_by?: string | null
          created_at?: string | null
          description?: string | null
          destination_branch_id?: string
          fare_amount?: number
          id?: string
          mpesa_receipt?: string | null
          origin_branch_id?: string
          payment_status?: string | null
          receiver_name?: string
          receiver_phone?: string
          sender_name?: string
          sender_phone?: string
          status?: string | null
          tracking_code?: string
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcels_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_destination_branch_id_fkey"
            columns: ["destination_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_origin_branch_id_fkey"
            columns: ["origin_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          mpesa_checkout_request_id: string | null
          mpesa_receipt_number: string | null
          phone: string
          raw_callback: Json | null
          reference_id: string
          reference_type: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          mpesa_checkout_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone: string
          raw_callback?: Json | null
          reference_id: string
          reference_type: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          mpesa_checkout_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone?: string
          raw_callback?: Json | null
          reference_id?: string
          reference_type?: string
          status?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          base_fare: number
          created_at: string | null
          destination: string
          id: string
          origin_branch_id: string | null
        }
        Insert: {
          base_fare: number
          created_at?: string | null
          destination: string
          id?: string
          origin_branch_id?: string | null
        }
        Update: {
          base_fare?: number
          created_at?: string | null
          destination?: string
          id?: string
          origin_branch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_origin_branch_id_fkey"
            columns: ["origin_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          branch_id: string
          bus_plate: string | null
          created_at: string | null
          departure_time: string
          id: string
          route_id: string | null
          seats_booked: number
          status: string | null
          total_seats: number
        }
        Insert: {
          branch_id: string
          bus_plate?: string | null
          created_at?: string | null
          departure_time: string
          id?: string
          route_id?: string | null
          seats_booked?: number
          status?: string | null
          total_seats?: number
        }
        Update: {
          branch_id?: string
          bus_plate?: string | null
          created_at?: string | null
          departure_time?: string
          id?: string
          route_id?: string | null
          seats_booked?: number
          status?: string | null
          total_seats?: number
        }
        Relationships: [
          {
            foreignKeyName: "trips_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_branch: { Args: never; Returns: string }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      expire_pending_bookings: { Args: never; Returns: undefined }
      get_taken_seats: {
        Args: { _trip_id: string }
        Returns: {
          seat_number: string
        }[]
      }
    }
    Enums: {
      user_role: "admin" | "clerk"
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
      user_role: ["admin", "clerk"],
    },
  },
} as const
