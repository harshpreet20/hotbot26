export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    PostgrestVersion: "12.2.3 (519615d)"
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: 'super_admin' | 'admin' | 'editor' | 'finance'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'admin' | 'editor' | 'finance'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: 'super_admin' | 'admin' | 'editor' | 'finance'
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          password_hash: string
          role: 'super_admin' | 'admin' | 'editor' | 'finance'
          email: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          username: string
          password_hash: string
          role?: 'super_admin' | 'admin' | 'editor' | 'finance'
          email?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          password_hash?: string
          role?: 'super_admin' | 'admin' | 'editor' | 'finance'
          email?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          token: string
          expires_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          token: string
          expires_at: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          token?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          }
        ]
      }
      blog_posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          slug: string
          content: string | null
          excerpt: string | null
          cover_image: string | null
          tags: string[]
          status: 'draft' | 'published' | 'archived'
          author_id: string | null
          published_at: string | null
          seo_title: string | null
          seo_description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          slug: string
          content?: string | null
          excerpt?: string | null
          cover_image?: string | null
          tags?: string[]
          status?: 'draft' | 'published' | 'archived'
          author_id?: string | null
          published_at?: string | null
          seo_title?: string | null
          seo_description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          slug?: string
          content?: string | null
          excerpt?: string | null
          cover_image?: string | null
          tags?: string[]
          status?: 'draft' | 'published' | 'archived'
          author_id?: string | null
          published_at?: string | null
          seo_title?: string | null
          seo_description?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string | null
          company: string | null
          status: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
          source: string | null
          tags: string[]
          notes: string | null
          assigned_to: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone?: string | null
          company?: string | null
          status?: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
          source?: string | null
          tags?: string[]
          notes?: string | null
          assigned_to?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string | null
          company?: string | null
          status?: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
          source?: string | null
          tags?: string[]
          notes?: string | null
          assigned_to?: string | null
        }
        Relationships: []
      }
      customer_interactions: {
        Row: {
          id: string
          created_at: string
          customer_id: string
          type: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
          summary: string | null
          details: Json | null
          created_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          customer_id: string
          type: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
          summary?: string | null
          details?: Json | null
          created_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          customer_id?: string
          type?: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
          summary?: string | null
          details?: Json | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          invoice_number: string
          customer_id: string
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date: string | null
          paid_at: string | null
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          notes: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          invoice_number?: string
          customer_id: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string | null
          paid_at?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          invoice_number?: string
          customer_id?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          due_date?: string | null
          paid_at?: string | null
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          total?: number
          notes?: string | null
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_items: {
        Row: {
          id: string
          created_at: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          sort_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price: number
          amount?: number
          sort_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          amount?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'super_admin' | 'admin' | 'editor' | 'finance'
      customer_status: 'lead' | 'prospect' | 'active' | 'inactive' | 'churned'
      blog_status: 'draft' | 'published' | 'archived'
      invoice_status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
      interaction_type: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
