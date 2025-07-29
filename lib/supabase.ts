"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const createServerClient = async () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: "consumer" | "fbo" | "admin"
          business_name: string | null
          business_address: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: "consumer" | "fbo" | "admin"
          business_name?: string | null
          business_address?: string | null
          avatar_url?: string | null
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          role?: "consumer" | "fbo" | "admin"
          business_name?: string | null
          business_address?: string | null
          avatar_url?: string | null
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string
          name: string
          description: string | null
          category: "bakery" | "vegetables" | "dairy" | "meat" | "fruits" | "beverages" | "other"
          original_price: number
          discounted_price: number
          quantity: number
          expiry_date: string
          image_urls: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          seller_id: string
          name: string
          description?: string | null
          category: "bakery" | "vegetables" | "dairy" | "meat" | "fruits" | "beverages" | "other"
          original_price: number
          discounted_price: number
          quantity: number
          expiry_date: string
          image_urls?: string[] | null
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          category?: "bakery" | "vegetables" | "dairy" | "meat" | "fruits" | "beverages" | "other"
          original_price?: number
          discounted_price?: number
          quantity?: number
          expiry_date?: string
          image_urls?: string[] | null
          is_active?: boolean
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          user_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          total_amount: number
          status: "pending" | "confirmed" | "ready" | "completed" | "cancelled"
          pickup_time: string | null
          notes: string | null
          delivery_address: string
          phone_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          seller_id: string
          total_amount: number
          status?: "pending" | "confirmed" | "ready" | "completed" | "cancelled"
          pickup_time?: string | null
          notes?: string | null
          delivery_address: string
          phone_number: string
        }
        Update: {
          status?: "pending" | "confirmed" | "ready" | "completed" | "cancelled"
          pickup_time?: string | null
          notes?: string | null
          delivery_address?: string
          phone_number?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Insert: {
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
    }
  }
}
