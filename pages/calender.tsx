import { GetServerSideProps } from 'next';
import dayjs from 'dayjs';

// This page only exists for backward compatibility.
// It redirects /calender?year=&month= → /events?view=calendar&year=&month=
const Calender = () => null;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const now = dayjs();
  const yearParam = Number(context.query.year);
  const monthParam = Number(context.query.month);
  const year = Number.isFinite(yearParam) && yearParam > 0 ? yearParam : now.year();
  const month = Number.isFinite(monthParam) && monthParam >= 1 && monthParam <= 12
    ? monthParam
    : now.month() + 1;

  return {
    redirect: {
      destination: `/events?view=calendar&year=${year}&month=${month}`,
      permanent: false, // 307
    },
  };
};

export default Calender;
