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
  short_description: string | null;
}

export interface HostListMeta {
  total_hosts: number;
  total_ongoing_events: number;
  page: number;
  size: number;
  total_pages: number;
  /** 검색어·분류 조건을 만족하는 전체 건수 */
  filtered_hosts: number;
}

export interface HostListResponse {
  meta: HostListMeta;
  hosts: HostListItem[];
}

export interface HostChip {
  label: string;
  // 'ghost' 는 서버 buildChips 가 만들지 않는 미사용 값이라 계약에서 제거했다 (CON-058).
  variant: 'live' | 'default';
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
  /** 평균 개최 주기 문구 (예: '월 1.2회'). 산출 불가 시 null */
  average_cadence: string | null;
  // 서버 EventHostFacade 가 null 을 반환할 수 있다.
  recent_delta: string | null;
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
  // 서버가 null 을 반환할 수 있다 (meta_history: 행사 이력 없음 / description: nullable 컬럼).
  meta_history: string | null;
  description: string | null;
  chips: HostChip[];
  ongoing_events: Event[];
  past_events: Event[];
  /** 탭 카운트용 총건수. ongoing_events/past_events 는 서버가 20건으로 캡한다. */
  ongoing_events_total: number;
  past_events_total: number;
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
