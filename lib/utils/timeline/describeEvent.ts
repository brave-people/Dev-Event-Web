import { Event } from 'model/event';
import {
  dayKey,
  diffDays,
  formatHm,
  formatMdw,
  parseNaive,
} from 'lib/utils/timeline/kst';
import { readEventPeriod } from 'lib/utils/timeline/period';

export type EventStatus = 'ended' | 'recruiting' | 'upcoming' | 'ongoing';
export type SlotTone = 'done' | 'dead' | 'open';

export interface EventSlot {
  tone: SlotTone;
  chip: string;
  time: string;
  extra: string;
}

export interface TimelineEvent {
  event: Event;
  status: EventStatus;
  dateKey: string;
  sortAt: number;
  endAt: number;
  slot: EventSlot;
  isNew: boolean;
}

export const NEW_DAYS = 3;

export const describeEvent = (event: Event, now: string): TimelineEvent => {
  const nowMs = parseNaive(now);
  const todayKey = dayKey(nowMs);

  const period = readEventPeriod(event);

  const createdMs = parseNaive(event.create_date_time);
  const isNewDay = (): boolean =>
    !Number.isNaN(createdMs) &&
    diffDays(todayKey, dayKey(createdMs)) <= NEW_DAYS;

  if (!period) {
    // 둘 다 읽을 수 없으면 행사를 잃지 않도록 오늘 묶음에 시각 없이 보여 준다
    return {
      event,
      status: 'ongoing',
      dateKey: todayKey,
      sortAt: nowMs,
      endAt: nowMs,
      slot: { tone: 'open', chip: '행사', time: '', extra: '' },
      isNew: isNewDay(),
    };
  }

  const { startDay, endDay, startAt, endAt, startHasTime, endHasTime, oneDay } =
    period;
  const isRecruit = event.event_time_type === 'RECRUIT';

  let status: EventStatus;
  if (nowMs > endAt) status = 'ended';
  else if (isRecruit) status = 'recruiting';
  else if (startAt > nowMs) status = 'upcoming';
  else status = 'ongoing';

  let dateKey: string;
  let sortAt: number;
  let slot: EventSlot;
  if (status === 'ended') {
    dateKey = endDay;
    sortAt = endAt;
    slot = {
      tone: 'done',
      chip: isRecruit ? '접수 종료' : '행사 종료',
      time: '',
      extra: '',
    };
  } else if (status === 'recruiting') {
    dateKey = endDay;
    sortAt = endAt;
    slot = {
      tone: 'dead',
      chip: '접수 마감',
      time: endHasTime ? formatHm(endAt) : '',
      extra: '',
    };
  } else if (status === 'upcoming') {
    dateKey = startDay;
    sortAt = startAt;
    let time = '';
    if (startHasTime && (oneDay || formatHm(startAt) !== '00:00')) {
      time = formatHm(startAt);
      if (oneDay && endHasTime) time += ` ~ ${formatHm(endAt)}`;
    }
    slot = {
      tone: 'open',
      chip: '행사',
      time,
      extra: oneDay ? '' : `${formatMdw(endDay)}까지`,
    };
  } else {
    dateKey = todayKey;
    sortAt = nowMs;
    slot = {
      tone: 'open',
      chip: '진행 중',
      time: '',
      extra: `${formatMdw(endDay)}까지`,
    };
  }

  const isNew = status !== 'ended' && isNewDay();

  return { event, status, dateKey, sortAt, endAt, slot, isNew };
};
