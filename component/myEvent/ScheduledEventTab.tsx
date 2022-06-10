import React from 'react';
import style from 'styles/myevent.module.scss';
import classNames from 'classnames/bind';
import { useMyEvent } from 'lib/hooks/useSWR';
import Item from 'component/common/item/Item';

const cn = classNames.bind(style);

const ScheduledEventTab = () => {
  const { myEvent, isLoading, isError } = useMyEvent({ filter: 'FUTURE' });

  return (
    <div className={cn('tab__body')}>
      <article className={cn('today-event')}>
        <div className={cn('today-event__list')}>
          {/* {myEvent?.dev_event.map((event: any) => {
            return <div className={cn('wrapper')}>{<Item data={event} isSelected={true} />}</div>;
          })} */}
        </div>
      </article>
      <section className={cn('section')}>
        <div className={cn('section__list')}>
          {!myEvent?.dev_event ? (
            <div>데이터가 없습니다</div>
          ) : (
            myEvent.dev_event.map((event: any) => {
              return <div className={cn('wrapper')}>{<Item data={event} isSelected={true} />}</div>;
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default ScheduledEventTab;
