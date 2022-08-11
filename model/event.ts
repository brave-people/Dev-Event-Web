import { Calender, WeekType } from 'model/calender';
import { TagResponse } from 'model/tag';

export type EventTimeType = 'DATE' | 'RECRUIT';

export interface Event {
  id: string;
  title: string;
  organizer: string;
  event_link: string;
  cover_image_link: string;
  display_sequence: number;
  event_time_type: EventTimeType;
  start_day_week: WeekType;
  start_time: string;
  start_date_time: string;
  end_day_week: WeekType;
  end_time: string;
  end_date_time: string;
  create_date_time: string;
  tags: TagResponse[];
}

export interface EventMetaData extends Calender {
  total: number;
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
