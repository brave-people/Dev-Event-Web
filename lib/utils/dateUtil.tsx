import dayjs from 'dayjs';

const DateUtil = {
  setDateTimeToDate: (date?: string) => {
    return dayjs(date).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
  },

  getDay: (date: string) => {
    const dayArr = ['일', '월', '화', '수', '목', '금', '토'];

    const index = dayjs(date).get('day');
    const day = dayArr[index];
    return day;
  },

  getDateFormat: (date: string, hasWeek?: { hasWeek: boolean }) => {
    let formatDate;
    formatDate = dayjs(date).format('YYYY.MM.DD');

    if (hasWeek) {
      formatDate += `(${DateUtil.getDay(date)})`;
    }

    return formatDate;
  },

  getDateTimeFormat: ({ date, time }: { date: string; time: string }) => {
    const formatDate = `${DateUtil.getDateFormat(date, { hasWeek: true })} ${time}`;
    return formatDate;
  },

  getPeriodFormat: ({
    startDate,
    endDate,
    startTime,
    endTime,
  }: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  }) => {
    let formatDate;
    const isCondition = (condition: 'time' | 'date' | 'dateTime') => {
      switch (condition) {
        case 'dateTime':
          return DateUtil.getDateFormat(startDate) !== DateUtil.getDateFormat(endDate) && endTime && startTime;
        case 'date':
          return (
            DateUtil.getDateFormat(startDate) !== DateUtil.getDateFormat(endDate) &&
            (!(startTime && endTime) || startTime === endTime)
          );
        case 'time':
          return (
            DateUtil.getDateFormat(startDate) === DateUtil.getDateFormat(endDate) &&
            endTime &&
            startTime &&
            startTime !== endTime
          );
      }
    };

    if (isCondition('dateTime')) {
      formatDate = `${DateUtil.getDateFormat(startDate, { hasWeek: true })} ${startTime} ~ ${DateUtil.getDateFormat(
        endDate,
        { hasWeek: true }
      )} ${endTime}`;
    }

    if (isCondition('date')) {
      formatDate = `${DateUtil.getDateFormat(startDate, { hasWeek: true })} ~ ${DateUtil.getDateFormat(endDate, {
        hasWeek: true,
      })}`;
    }

    if (isCondition('time')) {
      formatDate = `${DateUtil.getDateFormat(startDate, { hasWeek: true })} ${startTime} ~ ${endTime}`;
    }

    return formatDate;
  },
};

export { DateUtil };
