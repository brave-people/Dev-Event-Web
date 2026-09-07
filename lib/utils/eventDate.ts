import { DateUtil } from 'lib/utils/dateUtil';
import { EventDate, EventTimeType } from 'model/event';

type DateFormatType = 'dateTime' | 'date' | 'time';

const convert = (date: string, type: DateFormatType): string => {
  switch (type) {
    case 'time':
      return DateUtil.getTimeFormat(date);
    case 'date':
      return DateUtil.getDateFormat(date, { hasWeek: true });
    case 'dateTime':
      return DateUtil.getDateTimeFormat(date);
  }
};

/** 목록·상세 공용 행사 기간 문자열. use_*_date_time_yn === 'Y'일 때만 시간을 표시한다. */
export const formatEventPeriod = (e: EventDate): string => {
  const hasStart = Boolean(e.start_date_time);
  const hasEnd = Boolean(e.end_date_time);
  const startType: DateFormatType =
    e.use_start_date_time_yn === 'Y' ? 'dateTime' : 'date';

  if (hasStart && !hasEnd) return convert(e.start_date_time, startType);

  if (!hasStart && hasEnd) {
    const endType: DateFormatType =
      e.use_end_date_time_yn === 'Y' ? 'dateTime' : 'date';
    return `${convert(e.end_date_time, endType)} 까지`;
  }

  if (hasStart && hasEnd) {
    const isSameDay =
      DateUtil.getDateFormat(e.start_date_time) ===
      DateUtil.getDateFormat(e.end_date_time);
    const endType: DateFormatType = isSameDay
      ? 'time'
      : e.use_end_date_time_yn === 'Y'
      ? 'dateTime'
      : 'date';
    return `${convert(e.start_date_time, startType)} ~ ${convert(
      e.end_date_time,
      endType
    )}`;
  }

  return '';
};

export const getEventTimeLabel = (type: EventTimeType): '일시' | '접수' =>
  type === 'DATE' ? '일시' : '접수';
