import dayjs from 'dayjs';

const DateUtil = {
  isDone: (date: string) => {
    const todayDate = DateUtil.setDateTimeToDate();
    const inputDate = DateUtil.setDateTimeToDate(date);
    return inputDate.diff(todayDate, 'day') > 0 ||
      (inputDate.diff(todayDate, 'day') === 0 && inputDate.get('day') === todayDate.get('day'))
      ? false
      : true;
  },

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
      formatDate += ` (${DateUtil.getDay(date)})`;
    }

    return formatDate;
  },

  getTimeFormat: (date: string) => {
    const formatTime = dayjs(date).format('HH:mm');
    return formatTime;
  },

  getDateTimeFormat: (date: string) => {
    const formatDate = `${DateUtil.getDateFormat(date, { hasWeek: true })} ${DateUtil.getTimeFormat(date)}`;
    return formatDate;
  },
};

export { DateUtil };
