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

const getEndDate = () => {
  const year = new Date().getFullYear();
  return (`${year}-12`)
}

const getStartDate = () => {
  const year = new Date().getFullYear() - 1;
  return (`${year}-01`)
}

const getDateList = () => {
  const list = [];
  let currentDate = dayjs(getStartDate());
  for (let i = 0; i < 24; i++) {
    list.push(currentDate.format('YYYY년 MM월'));
    currentDate = currentDate.subtract(-1, 'M');
  }
  return list;
};

const getMonth = () => {
  let month = new Date().getMonth();
  if (month === 12)
    month = 1;
  else
    month += 1;
  if (month.toString().length !== 2)
    return (`0${month}`)
  return (month.toString());
}

const getCurrentDate = () => {
  const year = new Date().getFullYear();
  const month = getMonth();
  return (`${year}년 ${month}월`);
}

const removeDupDate = (eventDate: string | undefined) => {
  if (eventDate === undefined)
    return ;
  if (eventDate?.length !== 43) {
    const sepDate = eventDate?.split('.');
    const month = sepDate[1][0] === '0' ? `${sepDate[1][1]}월` : `${sepDate[1]}월`;
    const date = sepDate[2][0] === '0' ? `${sepDate[2][1]}일` : `${sepDate[2].slice(0, 2)}일`;
    const time = sepDate[2].slice(2, sepDate[2].length);
    return (`${month} ${date}${time}`);
  }
  const startDate = eventDate.split('~')[0].split('.');
  const endDate = eventDate.split('~')[1].split('.');
  const prevMonth = startDate[1][0] === '0' ? `${startDate[1][1]}월` : `${startDate[1]}월`;
  const nextMonth = endDate[1][0] === '0' ? `${endDate[1][1]}월` : `${endDate[1]}월`;
  const prevDate = startDate[2][0] === '0' ? `${startDate[2][1]}일` : `${startDate[2].slice(0, 2)}일`;
  const nextDate = endDate[2][0] === '0' ? `${endDate[2][1]}일` : `${endDate[2].slice(0, 2)}일`;
  if (startDate[1] === endDate[1]) {
    return (`${prevMonth}${prevDate}${startDate[2].slice(2, startDate[2].length)}~ ${nextDate}${endDate[2].slice(2, endDate[2].length)}`);
  }
  return (`${prevMonth}${prevDate}${startDate[2].slice(2, startDate[2].length)}~ ${nextMonth}${nextDate}${endDate[2].slice(2, endDate[2].length)}`);
}

export { 
  DateUtil,
  getDateList,
  getStartDate,
  getEndDate,
  getCurrentDate,
  getMonth,
  removeDupDate
};
