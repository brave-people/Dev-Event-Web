import React from 'react';
import style from 'styles/myevent.module.scss';
import classNames from 'classnames/bind';
import Item from 'component/common/item/Item';
import { useMyEvent } from 'lib/hooks/useSWR';

const cn = classNames.bind(style);

const DoneEventTab = () => {
  const { myEvent, isLoading, isError } = useMyEvent({ filter: 'OLD' });

  return (
    <div className={cn('tab__body')}>
      <section className={cn('section')}>
        <div className={cn('section__list')}>
          {!myEvent ? (
            <div>데이터가 없습니다</div>
          ) : (
            myEvent.map((event: any) => {
              return (
                <div className={cn('wrapper')}>
                  <Item key={event.id} data={event.dev_event} isSelected={false} />
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default DoneEventTab;
