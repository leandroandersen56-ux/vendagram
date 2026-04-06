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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credentials: {
        Row: {
          created_at: string
          data_encrypted: string
          delivered_at: string | null
          id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          data_encrypted: string
          delivered_at?: string | null
          id?: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          data_encrypted?: string
          delivered_at?: string | null
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credentials_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_requests: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          id: string
          pix_key: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string
          id?: string
          pix_key?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          pix_key?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          opened_by: string
          resolution: string | null
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          transaction_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          opened_by: string
          resolution?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          transaction_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          opened_by?: string
          resolution?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_transfers: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          from_user_id: string
          id: string
          to_user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          from_user_id: string
          id?: string
          to_user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          from_user_id?: string
          id?: string
          to_user_id?: string
        }
        Relationships: []
      }
      listing_views: {
        Row: {
          id: string
          listing_id: string
          session_id: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_views_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_views_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          accepts_offers: boolean
          category: Database["public"]["Enums"]["listing_category"]
          created_at: string
          description: string | null
          followers_count: number | null
          highlights: Json | null
          id: string
          includes: string | null
          level: number | null
          min_price: number | null
          platform_username: string | null
          prefilled_credentials: string | null
          price: number
          screenshots: string[] | null
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          accepts_offers?: boolean
          category?: Database["public"]["Enums"]["listing_category"]
          created_at?: string
          description?: string | null
          followers_count?: number | null
          highlights?: Json | null
          id?: string
          includes?: string | null
          level?: number | null
          min_price?: number | null
          platform_username?: string | null
          prefilled_credentials?: string | null
          price: number
          screenshots?: string[] | null
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          accepts_offers?: boolean
          category?: Database["public"]["Enums"]["listing_category"]
          created_at?: string
          description?: string | null
          followers_count?: number | null
          highlights?: Json | null
          id?: string
          includes?: string | null
          level?: number | null
          min_price?: number | null
          platform_username?: string | null
          prefilled_credentials?: string | null
          price?: number
          screenshots?: string[] | null
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          buyer_id: string
          buyer_message: string | null
          counter_price: number | null
          created_at: string
          expires_at: string
          final_price: number | null
          id: string
          listing_id: string
          offered_price: number
          original_price: number
          responded_at: string | null
          seller_id: string
          seller_message: string | null
          status: string
        }
        Insert: {
          buyer_id: string
          buyer_message?: string | null
          counter_price?: number | null
          created_at?: string
          expires_at?: string
          final_price?: number | null
          id?: string
          listing_id: string
          offered_price: number
          original_price: number
          responded_at?: string | null
          seller_id: string
          seller_message?: string | null
          status?: string
        }
        Update: {
          buyer_id?: string
          buyer_message?: string | null
          counter_price?: number | null
          created_at?: string
          expires_at?: string
          final_price?: number | null
          id?: string
          listing_id?: string
          offered_price?: number
          original_price?: number
          responded_at?: string | null
          seller_id?: string
          seller_message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allow_transfers_from_strangers: boolean | null
          avatar_url: string | null
          avg_rating: number
          bio: string | null
          cnpj: string | null
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          is_verified: boolean
          name: string | null
          phone: string | null
          pix_key: string | null
          referral_code: string | null
          total_purchases: number
          total_reviews: number
          total_sales: number
          updated_at: string
          user_id: string
          username: string | null
          whatsapp: string | null
        }
        Insert: {
          allow_transfers_from_strangers?: boolean | null
          avatar_url?: string | null
          avg_rating?: number
          bio?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean
          name?: string | null
          phone?: string | null
          pix_key?: string | null
          referral_code?: string | null
          total_purchases?: number
          total_reviews?: number
          total_sales?: number
          updated_at?: string
          user_id: string
          username?: string | null
          whatsapp?: string | null
        }
        Update: {
          allow_transfers_from_strangers?: boolean | null
          avatar_url?: string | null
          avg_rating?: number
          bio?: string | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_verified?: boolean
          name?: string | null
          phone?: string | null
          pix_key?: string | null
          referral_code?: string | null
          total_purchases?: number
          total_reviews?: number
          total_sales?: number
          updated_at?: string
          user_id?: string
          username?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_amount: number | null
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          status: string
          transaction_id: string | null
        }
        Insert: {
          commission_amount?: number | null
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          status?: string
          transaction_id?: string | null
        }
        Update: {
          commission_amount?: number | null
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
          transaction_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewed_id: string
          reviewer_id: string
          transaction_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transaction_messages: {
        Row: {
          allow_sensitive_data: boolean
          created_at: string
          id: string
          is_system: boolean
          message: string
          read_at: string | null
          sender_id: string
          transaction_id: string
        }
        Insert: {
          allow_sensitive_data?: boolean
          created_at?: string
          id?: string
          is_system?: boolean
          message: string
          read_at?: string | null
          sender_id: string
          transaction_id: string
        }
        Update: {
          allow_sensitive_data?: boolean
          created_at?: string
          id?: string
          is_system?: boolean
          message?: string
          read_at?: string | null
          sender_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_messages_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_steps: {
        Row: {
          confirmed_at: string | null
          confirmed_by_buyer: boolean
          confirmed_by_seller: boolean
          created_at: string
          id: string
          problem_description: string | null
          problem_reported: boolean
          step_index: number
          step_label: string
          transaction_id: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by_buyer?: boolean
          confirmed_by_seller?: boolean
          created_at?: string
          id?: string
          problem_description?: string | null
          problem_reported?: boolean
          step_index: number
          step_label: string
          transaction_id: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by_buyer?: boolean
          confirmed_by_seller?: boolean
          created_at?: string
          id?: string
          problem_description?: string | null
          problem_reported?: boolean
          step_index?: number
          step_label?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_steps_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          buyer_id: string
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          id: string
          listing_id: string
          paid_at: string | null
          platform_fee: number
          seller_id: string
          seller_receives: number
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_id: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          listing_id: string
          paid_at?: string | null
          platform_fee?: number
          seller_id: string
          seller_receives?: number
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          paid_at?: string | null
          platform_fee?: number
          seller_id?: string
          seller_receives?: number
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_listings"
            referencedColumns: ["id"]
          },
        ]
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
      verification_requests: {
        Row: {
          created_at: string
          doc_type: string
          documents: string[]
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_path: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type?: string
          documents?: string[]
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_path?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          documents?: string[]
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_path?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          pending: number
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          pending?: number
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          pending?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          id: string
          pix_key: string
          pix_key_type: string | null
          processed_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          pix_key: string
          pix_key_type?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          pix_key?: string
          pix_key_type?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_listings: {
        Row: {
          accepts_offers: boolean | null
          category: Database["public"]["Enums"]["listing_category"] | null
          created_at: string | null
          description: string | null
          followers_count: number | null
          highlights: Json | null
          id: string | null
          includes: string | null
          level: number | null
          min_price: number | null
          platform_username: string | null
          price: number | null
          screenshots: string[] | null
          seller_id: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          title: string | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          accepts_offers?: boolean | null
          category?: Database["public"]["Enums"]["listing_category"] | null
          created_at?: string | null
          description?: string | null
          followers_count?: number | null
          highlights?: Json | null
          id?: string | null
          includes?: string | null
          level?: number | null
          min_price?: number | null
          platform_username?: string | null
          price?: number | null
          screenshots?: string[] | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          accepts_offers?: boolean | null
          category?: Database["public"]["Enums"]["listing_category"] | null
          created_at?: string | null
          description?: string | null
          followers_count?: number | null
          highlights?: Json | null
          id?: string | null
          includes?: string | null
          level?: number | null
          min_price?: number | null
          platform_username?: string | null
          price?: number | null
          screenshots?: string[] | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          title?: string | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          avg_rating: number | null
          bio: string | null
          created_at: string | null
          id: string | null
          is_verified: boolean | null
          name: string | null
          referral_code: string | null
          total_purchases: number | null
          total_reviews: number | null
          total_sales: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          name?: string | null
          referral_code?: string | null
          total_purchases?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          is_verified?: boolean | null
          name?: string | null
          referral_code?: string | null
          total_purchases?: number | null
          total_reviews?: number | null
          total_sales?: number | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_release_escrow: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_wallet: {
        Args: { amount: number; field: string; user_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      dispute_status: "open" | "under_review" | "resolved" | "closed"
      listing_category:
        | "free_fire"
        | "instagram"
        | "tiktok"
        | "facebook"
        | "youtube"
        | "valorant"
        | "fortnite"
        | "roblox"
        | "clash_royale"
        | "other"
      listing_status: "draft" | "active" | "sold" | "removed"
      transaction_status:
        | "pending_payment"
        | "paid"
        | "transfer_in_progress"
        | "credentials_sent"
        | "completed"
        | "disputed"
        | "cancelled"
        | "refunded"
      withdrawal_status: "pending" | "processing" | "processed" | "rejected"
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
      app_role: ["admin", "moderator", "user"],
      dispute_status: ["open", "under_review", "resolved", "closed"],
      listing_category: [
        "free_fire",
        "instagram",
        "tiktok",
        "facebook",
        "youtube",
        "valorant",
        "fortnite",
        "roblox",
        "clash_royale",
        "other",
      ],
      listing_status: ["draft", "active", "sold", "removed"],
      transaction_status: [
        "pending_payment",
        "paid",
        "transfer_in_progress",
        "credentials_sent",
        "completed",
        "disputed",
        "cancelled",
        "refunded",
      ],
      withdrawal_status: ["pending", "processing", "processed", "rejected"],
    },
  },
} as const
