import React from 'react';
import { useScheduledEvents } from 'lib/hooks/useSWR';
import { EventResponse, Event } from 'model/event';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import dayjs from 'dayjs';
import { ThreeDots } from 'react-loader-spinner';
import List from 'component/common/list/list';
import { DateUtil } from 'lib/utils/dateUtil';

const cn = classNames.bind(style);

const ScheduledEventList = () => {
  const { scheduledEvents, isError } = useScheduledEvents();

  if (isError) {
    return <div className={cn('null-container')}>이벤트 정보를 불러오는데 문제가 발생했습니다!</div>;
  }

  const checkEventDone = ({ endDate }: { endDate: string }) => {
    return DateUtil.isDone(endDate);
  };

  return (
    <>
      {scheduledEvents ? (
        scheduledEvents.length !== 0 ? (
          scheduledEvents
            .filter((events) => !(dayjs().get('month') + 1 > events.metadata.month))
            .map((event: EventResponse, index) => {
              return (
                <>
                  {index === 0 ? null : <hr className={cn('divider')} />}
                  <div className={cn('section__list')}>
                    <div className={cn('section__list__title')}>
                      <span>{`${event.metadata.year}년 ${event.metadata.month}월`}</span>
                    </div>
                    <List
                      data={
                        event &&
                        event.dev_event.filter((item) => checkEventDone({ endDate: item.end_date_time }) === false)
                      }
                    />
                  </div>
                </>
              );
            })
        ) : (
          <div className={cn('null-container')}>아직 조건에 맞는 개발자 행사가 없어요 📂</div>
        )
      ) : (
        <div className={cn('null-container')}>
          <ThreeDots color="#479EF1" height={60} width={60} />
        </div>
      )}
    </>
  );
};

export default ScheduledEventList;
