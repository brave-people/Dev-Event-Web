import React from 'react';
import Layout from 'component/common/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import router from 'next/router';
import { useMonthlyEvent } from 'lib/hooks/useSWR';
import { MdClose } from 'react-icons/md';
import { ThreeDots } from 'react-loader-spinner';
import List from 'component/common/list/list';
import EventFilters from './EventFilters';
import { Event } from 'model/event';
import { Calender } from 'model/calender';
const cn = classNames.bind(style);

const MonthlyEventList = ({ fallbackData, date }: { fallbackData: Event[]; date: Calender }) => {
  const { monthlyEvent, isError } = useMonthlyEvent({
    param: date,
    fallbackData: fallbackData,
  });

  if (isError) {
    return <div className={cn('null-container')}>이벤트 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

  return (
    <>
      <div className={cn('section__header')}>
        <span className={cn('section__header__desc')}>
          <span>검색결과</span>
        </span>
        <div className={cn('section__header__filters')}>
          <EventFilters />
        </div>
      </div>
      <div className={cn('section__list')}>
        <div className={cn('section__list__title')}>
          <span>{`${date.year}년 ${date.month}월`}</span>
          <div
            className={cn('reset-button')}
            onClick={(event) => {
              router.replace(`/events`);
            }}
          >
            <MdClose size={20} color="#676767" />
          </div>
        </div>
        {monthlyEvent && !isError ? (
          monthlyEvent.length !== 0 ? (
            <List
              data={monthlyEvent.sort((a, b) => {
                let target1 = a.end_date_time ? a.end_date_time : a.start_date_time;
                let target2 = b.end_date_time ? b.end_date_time : b.start_date_time;
                return +new Date(target2) - +new Date(target1);
              })}
            />
          ) : (
            <div className={cn('null-container')}>아직 조건에 맞는 개발자 행사가 없어요 📂</div>
          )
        ) : (
          <div className={cn('null-container')}>
            <ThreeDots color="#479EF1" height={60} width={60} />
          </div>
        )}
      </div>
    </>
  );
};

MonthlyEventList.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default MonthlyEventList;
