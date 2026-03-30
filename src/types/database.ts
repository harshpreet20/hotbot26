// Auto-typed Supabase schema definitions for hotbot26

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'admin' | 'editor' | 'user'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'admin' | 'editor' | 'user'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'admin' | 'editor' | 'user'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          author_id: string | null
          title: string
          slug: string
          excerpt: string | null
          content: string
          cover_image: string | null
          tags: string[]
          status: 'draft' | 'published' | 'archived'
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          title: string
          slug: string
          excerpt?: string | null
          content: string
          cover_image?: string | null
          tags?: string[]
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          cover_image?: string | null
          tags?: string[]
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'blog_posts_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      customers: {
        Row: {
          id: string
          created_by: string | null
          first_name: string
          last_name: string | null
          email: string | null
          phone: string | null
          company: string | null
          website: string | null
          source: string | null
          status: 'lead' | 'prospect' | 'active' | 'churned'
          tags: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by?: string | null
          first_name: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          website?: string | null
          source?: string | null
          status?: 'lead' | 'prospect' | 'active' | 'churned'
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string | null
          first_name?: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          company?: string | null
          website?: string | null
          source?: string | null
          status?: 'lead' | 'prospect' | 'active' | 'churned'
          tags?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'customers_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      customer_interactions: {
        Row: {
          id: string
          customer_id: string
          created_by: string | null
          type: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
          subject: string | null
          body: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          created_by?: string | null
          type: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
          subject?: string | null
          body?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          created_by?: string | null
          type?: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
          subject?: string | null
          body?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'customer_interactions_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          customer_id: string | null
          created_by: string | null
          invoice_number: string
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          issue_date: string
          due_date: string | null
          currency: string
          subtotal: number
          tax_rate: number
          tax_amount: number
          total: number
          notes: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          created_by?: string | null
          invoice_number?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          issue_date?: string
          due_date?: string | null
          currency?: string
          subtotal?: number
          tax_rate?: number
          notes?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          created_by?: string | null
          invoice_number?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          issue_date?: string
          due_date?: string | null
          currency?: string
          subtotal?: number
          tax_rate?: number
          notes?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'invoices_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          }
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          amount: number
          sort_order: number
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price: number
          sort_order?: number
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'invoice_items_invoice_id_fkey'
            columns: ['invoice_id']
            isOneToOne: false
            referencedRelation: 'invoices'
            referencedColumns: ['id']
          }
        ]
      }
      admin_users: {
        Row: {
          id: string
          username: string
          password_hash: string
          full_name: string | null
          role: 'super_admin' | 'admin' | 'editor' | 'finance'
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          full_name?: string | null
          role?: 'super_admin' | 'admin' | 'editor' | 'finance'
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          full_name?: string | null
          role?: 'super_admin' | 'admin' | 'editor' | 'finance'
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sessions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'admin_users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      next_invoice_number: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInteraction = Database['public']['Tables']['customer_interactions']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
