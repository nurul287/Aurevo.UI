export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          price: number
          product_id: string | null
          quantity: number
          session_id: string | null
          updated_at: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price: number
          product_id?: string | null
          quantity: number
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          available_quantity: number | null
          created_at: string | null
          id: string
          last_counted_at: string | null
          location: string | null
          quantity: number
          reorder_point: number | null
          reorder_quantity: number | null
          reserved_quantity: number | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          available_quantity?: number | null
          created_at?: string | null
          id?: string
          last_counted_at?: string | null
          location?: string | null
          quantity?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          reserved_quantity?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          available_quantity?: number | null
          created_at?: string | null
          id?: string
          last_counted_at?: string | null
          location?: string | null
          quantity?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          reserved_quantity?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          cost_per_unit: number | null
          created_at: string | null
          id: string
          location: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          new_quantity: number
          notes: string | null
          order_id: string | null
          order_item_id: string | null
          previous_quantity: number
          quantity: number
          reason: Database["public"]["Enums"]["movement_reason"]
          reference_number: string | null
          reserved_quantity: number | null
          total_cost: number | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          location?: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          new_quantity: number
          notes?: string | null
          order_id?: string | null
          order_item_id?: string | null
          previous_quantity: number
          quantity: number
          reason: Database["public"]["Enums"]["movement_reason"]
          reference_number?: string | null
          reserved_quantity?: number | null
          total_cost?: number | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          location?: string | null
          movement_type?: Database["public"]["Enums"]["movement_type"]
          new_quantity?: number
          notes?: string | null
          order_id?: string | null
          order_item_id?: string | null
          previous_quantity?: number
          quantity?: number
          reason?: Database["public"]["Enums"]["movement_reason"]
          reference_number?: string | null
          reserved_quantity?: number | null
          total_cost?: number | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          sku: string | null
          total_price: number
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          sku?: string | null
          total_price: number
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku?: string | null
          total_price?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json
          created_at: string | null
          discount_amount: number | null
          email: string | null
          estimated_delivery_date: string | null
          fulfillment_status:
            | Database["public"]["Enums"]["fulfillment_status"]
            | null
          guest_token: string | null
          guest_token_expires: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          phone: string | null
          session_id: string | null
          shipping_address: Json
          shipping_amount: number | null
          shipping_method_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address: Json
          created_at?: string | null
          discount_amount?: number | null
          email?: string | null
          estimated_delivery_date?: string | null
          fulfillment_status?:
            | Database["public"]["Enums"]["fulfillment_status"]
            | null
          guest_token?: string | null
          guest_token_expires?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone?: string | null
          session_id?: string | null
          shipping_address: Json
          shipping_amount?: number | null
          shipping_method_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json
          created_at?: string | null
          discount_amount?: number | null
          email?: string | null
          estimated_delivery_date?: string | null
          fulfillment_status?:
            | Database["public"]["Enums"]["fulfillment_status"]
            | null
          guest_token?: string | null
          guest_token_expires?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          phone?: string | null
          session_id?: string | null
          shipping_address?: Json
          shipping_amount?: number | null
          shipping_method_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          gateway_response: Json | null
          id: string
          order_id: string | null
          payment_intent_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          order_id?: string | null
          payment_intent_id?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          order_id?: string | null
          payment_intent_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          processed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          product_id: string | null
          sort_order: number | null
          url: string
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          url: string
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          url?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          content: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string | null
          rating: number
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          color: string | null
          color_code: string | null
          compare_at_price: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          material: string | null
          name: string | null
          price: number | null
          product_id: string | null
          size: string | null
          sku: string | null
          sort_order: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          color?: string | null
          color_code?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material?: string | null
          name?: string | null
          price?: number | null
          product_id?: string | null
          size?: string | null
          sku?: string | null
          sort_order?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          color?: string | null
          color_code?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material?: string | null
          name?: string | null
          price?: number | null
          product_id?: string | null
          size?: string | null
          sku?: string | null
          sort_order?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean | null
          base_price: number
          brand_id: string | null
          care_instructions: string | null
          category_id: string | null
          compare_at_price: number | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          gender: Database["public"]["Enums"]["product_gender"] | null
          id: string
          is_active: boolean | null
          is_digital: boolean | null
          is_featured: boolean | null
          low_stock_threshold: number | null
          material: string | null
          max_order_quantity: number | null
          meta_description: string | null
          meta_title: string | null
          min_order_quantity: number | null
          name: string
          requires_shipping: boolean | null
          short_description: string | null
          sku: string | null
          slug: string
          stock_quantity: number | null
          tags: string[] | null
          track_inventory: boolean | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          allow_backorder?: boolean | null
          base_price: number
          brand_id?: string | null
          care_instructions?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          gender?: Database["public"]["Enums"]["product_gender"] | null
          id?: string
          is_active?: boolean | null
          is_digital?: boolean | null
          is_featured?: boolean | null
          low_stock_threshold?: number | null
          material?: string | null
          max_order_quantity?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_order_quantity?: number | null
          name: string
          requires_shipping?: boolean | null
          short_description?: string | null
          sku?: string | null
          slug: string
          stock_quantity?: number | null
          tags?: string[] | null
          track_inventory?: boolean | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          allow_backorder?: boolean | null
          base_price?: number
          brand_id?: string | null
          care_instructions?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          gender?: Database["public"]["Enums"]["product_gender"] | null
          id?: string
          is_active?: boolean | null
          is_digital?: boolean | null
          is_featured?: boolean | null
          low_stock_threshold?: number | null
          material?: string | null
          max_order_quantity?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_order_quantity?: number | null
          name?: string
          requires_shipping?: boolean | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock_quantity?: number | null
          tags?: string[] | null
          track_inventory?: boolean | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          first_name: string | null
          gender: Database["public"]["Enums"]["user_gender"] | null
          id: string
          last_name: string | null
          phone: string | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["user_gender"] | null
          id: string
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["user_gender"] | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          company: string | null
          country: string
          created_at: string | null
          first_name: string
          id: string
          is_default: boolean | null
          last_name: string
          phone: string | null
          postal_code: string
          state: string
          type: Database["public"]["Enums"]["address_type"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          company?: string | null
          country?: string
          created_at?: string | null
          first_name: string
          id?: string
          is_default?: boolean | null
          last_name: string
          phone?: string | null
          postal_code: string
          state: string
          type?: Database["public"]["Enums"]["address_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          company?: string | null
          country?: string
          created_at?: string | null
          first_name?: string
          id?: string
          is_default?: boolean | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          type?: Database["public"]["Enums"]["address_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_product: {
        Args: {
          p_allow_backorder?: boolean
          p_base_price: number
          p_brand_id?: string
          p_care_instructions?: string
          p_category_id?: string
          p_compare_at_price?: number
          p_description?: string
          p_dimensions?: Json
          p_gender?: Database["public"]["Enums"]["product_gender"]
          p_initial_stock?: number
          p_is_featured?: boolean
          p_low_stock_threshold?: number
          p_material?: string
          p_max_order_quantity?: number
          p_meta_description?: string
          p_meta_title?: string
          p_min_order_quantity?: number
          p_name: string
          p_requires_shipping?: boolean
          p_short_description?: string
          p_sku?: string
          p_slug: string
          p_tags?: string[]
          p_track_inventory?: boolean
          p_user_id?: string
          p_variants?: Json
          p_weight?: number
        }
        Returns: Json
      }
      cancel_order: {
        Args: { p_order_id: string; p_reason?: string; p_user_id?: string }
        Returns: Json
      }
      check_low_stock: {
        Args: never
        Returns: {
          current_stock: number
          low_stock_threshold: number
          product_id: string
          product_name: string
          reorder_point: number
          reorder_quantity: number
          variant_id: string
          variant_name: string
        }[]
      }
      create_order: {
        Args: {
          billing_address: Json
          email: string
          guest_token?: string
          items: Json
          notes: string
          p_discount_amount?: number
          p_shipping_amount?: number
          p_tax_amount?: number
          payment_method?: string
          phone: string
          session_id: string
          shipping_address: Json
          user_id: string
        }
        Returns: Json
      }
      decrease_stock: {
        Args: {
          p_location?: string
          p_notes?: string
          p_order_id?: string
          p_order_item_id?: string
          p_quantity: number
          p_reference_number?: string
          p_user_id?: string
          p_variant_id: string
        }
        Returns: Json
      }
      get_inventory_summary: { Args: { p_product_id: string }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      log_inventory_movement: {
        Args: {
          p_cost_per_unit?: number
          p_location?: string
          p_movement_type: Database["public"]["Enums"]["movement_type"]
          p_notes?: string
          p_order_id?: string
          p_order_item_id?: string
          p_quantity: number
          p_reason: Database["public"]["Enums"]["movement_reason"]
          p_reference_number?: string
          p_user_id?: string
          p_variant_id: string
        }
        Returns: string
      }
      process_order_completion: {
        Args: { p_order_id: string; p_user_id?: string }
        Returns: Json
      }
      reserve_stock: {
        Args: {
          p_location?: string
          p_notes?: string
          p_order_id?: string
          p_order_item_id?: string
          p_quantity: number
          p_reference_number?: string
          p_user_id?: string
          p_variant_id: string
        }
        Returns: Json
      }
      restock_inventory: {
        Args: {
          p_cost_per_unit?: number
          p_location?: string
          p_notes?: string
          p_quantity: number
          p_reference_number?: string
          p_user_id?: string
          p_variant_id: string
        }
        Returns: Json
      }
      return_item: {
        Args: {
          p_is_resellable?: boolean
          p_order_id: string
          p_order_item_id: string
          p_quantity: number
          p_reason?: string
          p_user_id?: string
        }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unreserve_stock: {
        Args: {
          p_location?: string
          p_notes?: string
          p_order_id?: string
          p_order_item_id?: string
          p_quantity: number
          p_reference_number?: string
          p_user_id?: string
          p_variant_id: string
        }
        Returns: Json
      }
      update_product: {
        Args: {
          p_allow_backorder?: boolean
          p_base_price?: number
          p_brand_id?: string
          p_care_instructions?: string
          p_category_id?: string
          p_compare_at_price?: number
          p_description?: string
          p_dimensions?: Json
          p_gender?: Database["public"]["Enums"]["product_gender"]
          p_is_featured?: boolean
          p_low_stock_threshold?: number
          p_material?: string
          p_max_order_quantity?: number
          p_meta_description?: string
          p_meta_title?: string
          p_min_order_quantity?: number
          p_name?: string
          p_product_id: string
          p_requires_shipping?: boolean
          p_short_description?: string
          p_sku?: string
          p_slug?: string
          p_tags?: string[]
          p_track_inventory?: boolean
          p_user_id?: string
          p_weight?: number
        }
        Returns: Json
      }
    }
    Enums: {
      address_type: "billing" | "shipping"
      fulfillment_status: "unfulfilled" | "partial" | "fulfilled"
      movement_reason:
        | "purchase_order"
        | "customer_order"
        | "checkout_reserve"
        | "payment_failed"
        | "order_cancelled"
        | "customer_return"
        | "damaged_goods"
        | "inventory_count"
        | "theft_loss"
        | "location_transfer"
        | "manual_adjustment"
      movement_type:
        | "restock"
        | "sale"
        | "reserve"
        | "unreserve"
        | "cancel"
        | "return"
        | "adjustment"
        | "damage"
        | "theft"
        | "transfer"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_method: "cash" | "online"
      payment_status:
        | "pending"
        | "paid"
        | "failed"
        | "refunded"
        | "partially_refunded"
      product_gender: "men" | "women" | "unisex"
      user_gender: "male" | "female" | "other"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      address_type: ["billing", "shipping"],
      fulfillment_status: ["unfulfilled", "partial", "fulfilled"],
      movement_reason: [
        "purchase_order",
        "customer_order",
        "checkout_reserve",
        "payment_failed",
        "order_cancelled",
        "customer_return",
        "damaged_goods",
        "inventory_count",
        "theft_loss",
        "location_transfer",
        "manual_adjustment",
      ],
      movement_type: [
        "restock",
        "sale",
        "reserve",
        "unreserve",
        "cancel",
        "return",
        "adjustment",
        "damage",
        "theft",
        "transfer",
      ],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_method: ["cash", "online"],
      payment_status: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      product_gender: ["men", "women", "unisex"],
      user_gender: ["male", "female", "other"],
    },
  },
} as const

