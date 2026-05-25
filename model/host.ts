import { Event } from 'model/event';

export type HostClassification =
  | 'COMPANY'
  | 'COMMUNITY'
  | 'ACADEMIC'
  | 'GOVERNMENT'
  | 'EDUCATION'
  | 'MEDIA';

export type HostLinkType =
  | 'HOMEPAGE'
  | 'YOUTUBE'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'GITHUB'
  | 'BLOG'
  | 'ETC';

export type HostSort = 'activity' | 'recent' | 'name';

export type HostCategory = 'all' | 'ongoing' | HostClassification;

export type HostEventStatus = 'all' | 'ongoing' | 'past';

export interface HostListItem {
  id: number;
  host_name: string;
  logo_image_link: string | null;
  verified: boolean;
  classification: HostClassification;
  domain: string | null;
  ongoing_count: number;
  total_count: number;
  topics: string[];
}

export interface HostListMeta {
  total_hosts: number;
  total_ongoing_events: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface HostListResponse {
  meta: HostListMeta;
  hosts: HostListItem[];
}

export interface HostChip {
  label: string;
  variant: 'live' | 'default' | 'ghost';
}

export interface HostLink {
  id: number;
  type: HostLinkType;
  description: string | null;
  url: string;
  primary: boolean;
  display_order: number;
}

export interface HostTopic {
  id: number | null;
  name: string;
  count: number | null;
}

export interface HostSummary {
  total_events: number;
  first_event_date: string | null;
  recent_delta: string;
}

export interface HostDetail {
  id: number;
  host_name: string;
  logo_image_link: string | null;
  banner_image_link: string | null;
  verified: boolean;
  classification: HostClassification;
  domain: string | null;
  meta_location: string | null;
  meta_history: string;
  description: string;
  chips: HostChip[];
  ongoing_events: Event[];
  past_events: Event[];
  topics: HostTopic[];
  links: HostLink[];
  summary: HostSummary;
}

export interface HostEventsResponse {
  host_id: number;
  page: number;
  size: number;
  total_pages: number;
  total_elements: number;
  events: Event[];
}

export interface HostListParams {
  q?: string;
  category?: HostCategory;
  sort?: HostSort;
  page?: number;
  size?: number;
}

export interface HostEventsParams {
  status?: HostEventStatus;
  page?: number;
  size?: number;
}
