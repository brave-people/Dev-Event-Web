import { Calender, WeekType } from 'model/calender';
import { TagResponse } from 'model/tag';

export type EventTimeType = 'DATE' | 'RECRUIT';

export interface Event {
  id: string;
  title: string;
  description: string;
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
