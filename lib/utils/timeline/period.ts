import { EventDate } from 'model/event';
import { DAY_MS, dayKey, keyToMs, parseNaive } from 'lib/utils/timeline/kst';

export interface EventPeriod {
  startAt: number; // 벽시계 ms. 시각이 없으면 그날 0시
  endAt: number; // 벽시계 ms. 시각이 없으면 그날의 마지막 순간(다음 날 0시 − 1ms)
  startDay: string; // 'YYYY-MM-DD'
  endDay: string;
  startHasTime: boolean; // use_start_date_time_yn === 'Y'
  endHasTime: boolean;
  oneDay: boolean; // startDay === endDay
  startKnown: boolean; // start_date_time을 읽을 수 있었는지. false면 끝 날짜로 대신한 것
}

// 읽을 수 있는 쪽을 양쪽에 쓴다 (대체한 쪽의 시각 유무는 양쪽 'Y'가 모두 있어야 인정).
// 둘 다 읽을 수 없으면 null.
export const readEventPeriod = (event: EventDate): EventPeriod | null => {
  let startParsed = parseNaive(event.start_date_time);
  let endParsed = parseNaive(event.end_date_time);
  const startKnown = !Number.isNaN(startParsed);
  let startHasTime = event.use_start_date_time_yn === 'Y';
  let endHasTime = event.use_end_date_time_yn === 'Y';
  if (Number.isNaN(startParsed)) {
    startParsed = endParsed;
    startHasTime = startHasTime && endHasTime;
  }
  if (Number.isNaN(endParsed)) {
    endParsed = startParsed;
    endHasTime = endHasTime && startHasTime;
  }
  if (Number.isNaN(startParsed)) return null;

  const startDay = dayKey(startParsed);
  const endDay = dayKey(endParsed);
  return {
    startAt: startHasTime ? startParsed : keyToMs(startDay),
    endAt: endHasTime ? endParsed : keyToMs(endDay) + DAY_MS - 1,
    startDay,
    endDay,
    startHasTime,
    endHasTime,
    oneDay: startDay === endDay,
    startKnown,
  };
};
