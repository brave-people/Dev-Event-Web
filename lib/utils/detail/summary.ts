import { Event } from 'model/event';
import { describeEvent } from 'lib/utils/timeline/describeEvent';
import {
  DOW,
  formatHm,
  formatMdw,
  keyToMs,
  weekdayOf,
} from 'lib/utils/timeline/kst';
import { readEventPeriod } from 'lib/utils/timeline/period';

export interface WhenBlock {
  month: string; // 달력 한 장의 윗줄: '11월'
  day: string; // 달력 한 장의 숫자: '19'
  headline: string; // '11월 19일 목요일 18:00 접수 마감'
  range: string; // '접수 기간 10.19(월) 18:00 ~ 11.19(목) 18:00'
}

export interface HowBlock {
  icon: 'pin' | 'globe';
  headline: string; // '오프라인 진행'
  note: string; // '장소는 아래 행사 소개에서 확인해 주세요'
}

// 날짜를 읽을 수 없으면 null
export const describeWhen = (event: Event, now: string): WhenBlock | null => {
  const period = readEventPeriod(event);
  if (!period) return null;
  const { startDay, endDay, startAt, endAt, startHasTime, endHasTime, oneDay } =
    period;
  const isRecruit = event.event_time_type === 'RECRUIT';

  // 접수형은 마감일, 일시형은 시작일을 달력에 올린다
  const calendarDay = isRecruit ? endDay : startDay;
  const date = new Date(keyToMs(calendarDay));
  const month = `${date.getUTCMonth() + 1}월`;
  const day = `${date.getUTCDate()}`;

  let headline = `${month} ${day}일 ${DOW[weekdayOf(calendarDay)]}요일`;
  if (isRecruit) {
    headline += `${endHasTime ? ` ${formatHm(endAt)}` : ''} 접수 마감`;
  } else {
    const { time } = describeEvent(event, now).slot;
    if (time) headline += ` ${time}`;
  }

  let range =
    formatMdw(startDay) + (startHasTime ? ` ${formatHm(startAt)}` : '');
  if (oneDay) {
    if (endHasTime) range += ` ~ ${formatHm(endAt)}`;
  } else {
    range += ` ~ ${formatMdw(endDay)}${
      endHasTime ? ` ${formatHm(endAt)}` : ''
    }`;
  }
  if (isRecruit) range = `접수 기간 ${range}`;

  return { month, day, headline, range };
};

// 참여 방법 태그가 없으면 null
export const describeHow = (
  tags: { tag_name: string }[] | null | undefined
): HowBlock | null => {
  const modes = (tags || [])
    .map((t) => t.tag_name)
    .filter((name) => name === '온라인' || name === '오프라인');
  if (modes.length === 0) return null;
  const offline = modes.includes('오프라인');
  return {
    icon: offline ? 'pin' : 'globe',
    headline: `${modes.join(' · ')} 진행`,
    note: offline
      ? '장소는 아래 행사 소개에서 확인해 주세요'
      : '접속 방법은 신청 후 안내돼요',
  };
};

// 앞의 '[', '(', 공백을 건너뛴 첫 글자. 없으면 '?'
export const organizerInitial = (organizer: string): string => {
  const chars = Array.from((organizer || '').replace(/^[\s[(]+/, ''));
  return chars.length > 0 ? chars[0] : '?';
};
