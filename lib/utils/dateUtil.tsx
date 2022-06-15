import dayjs from 'dayjs';

const DateUtil = {
  getDateFormat: (date: string) => {
    const formattedDate = dayjs(date).format('YYYY.MM.DD');
    return formattedDate;
  },
};

export { DateUtil };
