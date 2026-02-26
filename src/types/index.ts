// src/types/index.ts

export interface Lead {
  id: string;
  ts: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message?: string;
  formType?: string;
  source?: string;
  status: "new" | "contacted" | "converted" | "lost";
}

export interface Service {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

export interface Product {
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  href: string;
}

export interface Testimonial {
  name: string;
  company: string;
  role: string;
  text: string;
  stars: number;
  initials: string;
  color: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  ts?: string;
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
}
