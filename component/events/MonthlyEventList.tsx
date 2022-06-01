import React from 'react';
import Layout from 'component/layout';
import type { ReactElement } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import { useRouter } from 'next/router';
import { useMonthlyEvent } from 'lib/hooks/useSWR';
import Item from 'component/common/item/Item';

const cn = classNames.bind(style);

const MonthlyEventList = () => {
  const router = useRouter();

  const { monthlyEvent, isLoading, isError } = useMonthlyEvent({
    param: { year: Number(router.query.year), month: Number(router.query.month) },
  });

  return (
    <>
      <section className={cn('section')}>
        <div className={cn('section__header')}>
          <span className={cn('section__header__title')}>{`${router.query.year}년 ${router.query.month}월`}</span>
        </div>
        <div className={cn('section__list')}>
          {monthlyEvent &&
            monthlyEvent.map((item: any) => {
              return <div className={cn('wrapper')}>{<Item key={item.id} data={item} isSelected={false} />}</div>;
            })}
        </div>
      </section>
      );
    </>
  );
};

MonthlyEventList.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
export default MonthlyEventList;
