// Core Types for OPGT Website

export interface Indicator {
  value: string;
  label: string;
  source: string;
}

export interface TeamMember {
  name: string;
  role: string;
  description: string;
  photo?: string;
}

export interface Policy {
  id: string;
  name: string;
  tag: string;
  description: string;
  details?: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  category?: string;
}

export interface Publication {
  id: string;
  title: string;
  type: 'report' | 'technical-note' | 'update';
  tag: string;
  description: string;
  date?: string;
  pages?: number;
  downloads?: {
    pdf?: string;
    summary?: string;
    data?: string;
  };
}

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface Partner {
  name: string;
  role: string;
  description: string;
  logo?: string;
}

export interface Audience {
  name: string;
  badge: string;
  description: string;
}
