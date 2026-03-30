// Auto-typed Supabase schema definitions for hotbot26

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
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
          full_name?: string | null
          role?: 'admin' | 'editor' | 'user'
          avatar_url?: string | null
          updated_at?: string
        }
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
          author_id?: string | null
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          cover_image?: string | null
          tags?: string[]
          status?: 'draft' | 'published' | 'archived'
          published_at?: string | null
          updated_at?: string
        }
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
          updated_at?: string
        }
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
          type?: 'email' | 'call' | 'meeting' | 'note' | 'form' | 'chat'
          subject?: string | null
          body?: string | null
        }
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
          customer_id?: string | null
          invoice_number?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
          issue_date?: string
          due_date?: string | null
          currency?: string
          subtotal?: number
          tax_rate?: number
          notes?: string | null
          paid_at?: string | null
          updated_at?: string
        }
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
          description?: string
          quantity?: number
          unit_price?: number
          sort_order?: number
        }
      }
    }
    Functions: {
      next_invoice_number: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInteraction = Database['public']['Tables']['customer_interactions']['Row']
export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
