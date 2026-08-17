import { Calender, WeekType } from 'model/calender';
import { TagResponse } from 'model/tag';

export type EventTimeType = 'DATE' | 'RECRUIT';

/**
 * 행사에 연결된 주최자.
 * 서버 `EventHostReadDTO`와 1:1 (SNAKE_CASE 직렬화).
 * 주최자 상세로 이동할 때는 반드시 이 `id`를 써야 한다 — 이름 문자열 라우팅은 404.
 */
export interface EventHost {
  id: number;
  host_name: string;
  description: string | null;
  image_link: string | null;
}

export interface Event {
  // 서버 DevEventResponseV2DTO.id 는 Long → JSON 숫자다.
  id: number;
  title: string;
  // 목록·주최자 상세 응답에서는 서버가 항상 null 로 비운다 (상세 API 에서만 채워짐).
  description: string | null;
  organizer: string;
  event_link: string;
  cover_image_link: string;
  display_sequence: number;
  event_time_type: EventTimeType;
  start_day_week: WeekType;
  start_date_time: string;
  end_day_week: WeekType;
  end_date_time: string;
  tags: TagResponse[];
  create_date_time: string;
  use_end_date_time_yn: 'Y' | 'N' | null;
  use_start_date_time_yn: 'Y' | 'N' | null;
  hosts?: EventHost[];
}

export interface EventMetaData extends Calender {
  total: number;
  year: number;
  month: number;
}

export interface EventDate {
  start_date_time: string;
  end_date_time: string;
  use_start_date_time_yn: 'Y' | 'N' | null;
  use_end_date_time_yn: 'Y' | 'N' | null;
}

export interface EventResponse {
  metadata: EventMetaData;
  dev_event: Event[];
}

export interface MyEvent {
  dev_event: Event;
  favorite_id: 0;
}

export interface MyEventGetProps {
  filter: string;
}
export interface MyEventPostProps {
  eventId: Number;
}

export interface MyEventDeleteProps {
  favoriteId: Number;
}

export interface MyEventResponse {
  message: string;
  status: string;
  status_code: Number;
}
