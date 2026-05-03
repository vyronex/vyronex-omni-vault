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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      balance_audit_log: {
        Row: {
          amount_change: number
          balance_after: number
          balance_before: number
          created_at: string
          created_by: string | null
          id: string
          operation_type: string
          token_symbol: string
          trade_id: string | null
          user_id: string
        }
        Insert: {
          amount_change: number
          balance_after: number
          balance_before: number
          created_at?: string
          created_by?: string | null
          id?: string
          operation_type: string
          token_symbol: string
          trade_id?: string | null
          user_id: string
        }
        Update: {
          amount_change?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          created_by?: string | null
          id?: string
          operation_type?: string
          token_symbol?: string
          trade_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      balances: {
        Row: {
          balance: number
          id: string
          last_updated: string | null
          token_address: string | null
          token_symbol: string
          usd_value: number | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          balance?: number
          id?: string
          last_updated?: string | null
          token_address?: string | null
          token_symbol: string
          usd_value?: number | null
          user_id: string
          wallet_id: string
        }
        Update: {
          balance?: number
          id?: string
          last_updated?: string | null
          token_address?: string | null
          token_symbol?: string
          usd_value?: number | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balances_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          expires_at: string | null
          filled_quantity: number | null
          id: string
          order_type: string
          price: number
          quantity: number
          remaining_quantity: number
          side: string
          status: string
          trading_pair_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          filled_quantity?: number | null
          id?: string
          order_type: string
          price: number
          quantity: number
          remaining_quantity: number
          side: string
          status?: string
          trading_pair_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          filled_quantity?: number | null
          id?: string
          order_type?: string
          price?: number
          quantity?: number
          remaining_quantity?: number
          side?: string
          status?: string
          trading_pair_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      staking_records: {
        Row: {
          amount: number
          apr: number
          created_at: string | null
          end_date: string | null
          id: string
          lock_period_days: number
          rewards_earned: number | null
          start_date: string | null
          status: string
          token_symbol: string
          user_id: string
        }
        Insert: {
          amount: number
          apr: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          lock_period_days: number
          rewards_earned?: number | null
          start_date?: string | null
          status?: string
          token_symbol: string
          user_id: string
        }
        Update: {
          amount?: number
          apr?: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          lock_period_days?: number
          rewards_earned?: number | null
          start_date?: string | null
          status?: string
          token_symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      trade_audit_log: {
        Row: {
          buyer_id: string
          created_at: string | null
          created_by: string | null
          fee: number
          id: string
          notes: string | null
          price: number
          quantity: number
          seller_id: string
          total_value: number
          trade_id: string
          trading_pair_id: string
          validation_passed: boolean | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          created_by?: string | null
          fee: number
          id?: string
          notes?: string | null
          price: number
          quantity: number
          seller_id: string
          total_value: number
          trade_id: string
          trading_pair_id: string
          validation_passed?: boolean | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          created_by?: string | null
          fee?: number
          id?: string
          notes?: string | null
          price?: number
          quantity?: number
          seller_id?: string
          total_value?: number
          trade_id?: string
          trading_pair_id?: string
          validation_passed?: boolean | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          buyer_id: string
          created_at: string | null
          fee: number
          id: string
          order_id: string
          price: number
          quantity: number
          seller_id: string
          total_value: number
          trading_pair_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          fee: number
          id?: string
          order_id: string
          price: number
          quantity: number
          seller_id: string
          total_value: number
          trading_pair_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          fee?: number
          id?: string
          order_id?: string
          price?: number
          quantity?: number
          seller_id?: string
          total_value?: number
          trading_pair_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_trading_pair_id_fkey"
            columns: ["trading_pair_id"]
            isOneToOne: false
            referencedRelation: "trading_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_pairs: {
        Row: {
          base_token: string
          created_at: string | null
          fee_percentage: number | null
          id: string
          is_active: boolean | null
          max_order_size: number | null
          min_order_size: number | null
          quote_token: string
        }
        Insert: {
          base_token: string
          created_at?: string | null
          fee_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_order_size?: number | null
          min_order_size?: number | null
          quote_token: string
        }
        Update: {
          base_token?: string
          created_at?: string | null
          fee_percentage?: number | null
          id?: string
          is_active?: boolean | null
          max_order_size?: number | null
          min_order_size?: number | null
          quote_token?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          block_number: number | null
          chain: string
          confirmed_at: string | null
          created_at: string | null
          from_address: string
          gas_fee: number | null
          id: string
          status: string
          to_address: string
          token_symbol: string
          tx_hash: string
          tx_type: string
          usd_value: number | null
          user_id: string
          wallet_id: string
        }
        Insert: {
          amount: number
          block_number?: number | null
          chain: string
          confirmed_at?: string | null
          created_at?: string | null
          from_address: string
          gas_fee?: number | null
          id?: string
          status?: string
          to_address: string
          token_symbol: string
          tx_hash: string
          tx_type: string
          usd_value?: number | null
          user_id: string
          wallet_id: string
        }
        Update: {
          amount?: number
          block_number?: number | null
          chain?: string
          confirmed_at?: string | null
          created_at?: string | null
          from_address?: string
          gas_fee?: number | null
          id?: string
          status?: string
          to_address?: string
          token_symbol?: string
          tx_hash?: string
          tx_type?: string
          usd_value?: number | null
          user_id?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vault_deposits: {
        Row: {
          amount: number
          created_at: string
          earned_amount: number
          id: string
          locked_at: string
          status: string
          strategy_id: string
          token_symbol: string
          unlock_at: string
          updated_at: string
          user_id: string
          withdrawn_at: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          earned_amount?: number
          id?: string
          locked_at?: string
          status?: string
          strategy_id: string
          token_symbol?: string
          unlock_at: string
          updated_at?: string
          user_id: string
          withdrawn_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          earned_amount?: number
          id?: string
          locked_at?: string
          status?: string
          strategy_id?: string
          token_symbol?: string
          unlock_at?: string
          updated_at?: string
          user_id?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_deposits_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "vault_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_strategies: {
        Row: {
          apr_percent: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_lock_days: number
          min_lock_days: number
          name: string
          penalty_percent: number
          token_symbol: string
        }
        Insert: {
          apr_percent?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_lock_days?: number
          min_lock_days?: number
          name: string
          penalty_percent?: number
          token_symbol?: string
        }
        Update: {
          apr_percent?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_lock_days?: number
          min_lock_days?: number
          name?: string
          penalty_percent?: number
          token_symbol?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string
          chain: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          user_id: string
        }
        Insert: {
          address: string
          chain: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          user_id: string
        }
        Update: {
          address?: string
          chain?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_balance:
        | {
            Args: {
              p_amount: number
              p_token_symbol: string
              p_user_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_amount: number
              p_token_symbol: string
              p_trade_id?: string
              p_user_id: string
            }
            Returns: undefined
          }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
