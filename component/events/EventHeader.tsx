import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Dropdown from 'component/common/dropdown/Dropdown';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { BiPurchaseTagAlt } from 'react-icons/bi';
import router, { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useScheduledEvents, useTags } from 'lib/hooks/useSWR';
import * as ga from 'lib/utils/gTag';
import CheckButton from 'component/common/buttons/CheckButton';

const cn = classNames.bind(style);

const EventHeader = () => {
  const router = useRouter();
  const [filter, setFilter] = useState({ date: '전체', tag: '태그' });
  const [isNewViewed, setNewViewed] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [lastDate, setLastDate] = useState({ year: 0, month: 0 });

  const { tags, isLoading: isTagLoading, isError: isTagError } = useTags();
  const { scheduledEvents, isLoading: isEventsLoading, isError: isEventError } = useScheduledEvents();

  useEffect(() => {
    if (router.query.year && router.query.month) {
      setIsFiltered(true);
    } else if (router.query.tag || router.query.keyword) {
      setIsFiltered(true);
      setFilter({ ...filter, date: '전체' });
    } else {
      setIsFiltered(false);
      setFilter({ ...filter, date: '전체' });
    }
  }, [router.query]);

  useEffect(() => {
    composeTotalCount();
    getEventLastMonth();
  }, [scheduledEvents]);

  const composeTotalCount = () => {
    if (scheduledEvents && !isEventError && scheduledEvents.length !== 0) {
      const result = scheduledEvents.reduce(function add(sum, currValue) {
        const filteredEvents = currValue.dev_event.filter(
          (item) => checkEventDone({ endDate: item.end_date_time }) === false
        );
        return sum + filteredEvents.length;
      }, 0);
      setTotalCount(result);
    }
  };

  const checkEventDone = ({ endDate }: { endDate: string }) => {
    const todayDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
    const eventDate = dayjs(endDate).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);
    return eventDate.diff(todayDate, 'day') > 0 ||
      (eventDate.diff(todayDate, 'day') === 0 && eventDate.get('day') === todayDate.get('day'))
      ? false
      : true;
  };

  const getEventLastMonth = () => {
    if (scheduledEvents && !isEventError && scheduledEvents.length !== 0) {
      const lastyear = scheduledEvents[scheduledEvents.length - 1].metadata.year;
      const lastmonth = scheduledEvents[scheduledEvents.length - 1].metadata.month;
      setLastDate({ year: lastyear, month: lastmonth });
    }
  };

  const getDateList = () => {
    const list = ['전체'];
    let currentDate = dayjs()
      .set('year', lastDate.year)
      .set('month', lastDate.month - 1)
      .endOf('month');
    const startDate = dayjs('2022-06-01');
    while (startDate.isBefore(currentDate)) {
      list.push(currentDate.format('YYYY년 MM월'));
      currentDate = currentDate.subtract(1, 'M');
    }
    return list;
  };

  const getTagList = () => {
    if (tags && !isTagError) {
      const list = tags.map((tag) => {
        return { tag_name: tag.tag_name, tag_color: tag.tag_color };
      });
      return list;
    }
    return [];
  };

  return (
    <div className={cn('section__header')}>
      <EventCount isFiltered={isFiltered} totalCount={totalCount} />
      <div className={cn('section__header__filters')}>
        {isFiltered ? null : (
          <CheckButton
            label="New 이벤트만 보기"
            value={isNewViewed}
            onClick={() => {
              if (isNewViewed) {
                setNewViewed(false);
                router.replace(`/events`);
              } else {
                setNewViewed(true);
                router.replace(`/events?filter=new`);
              }
            }}
          />
        )}
        <span className={cn('wrapper')}>
          <Dropdown
            options={getDateList()}
            placeholder="전체"
            value={filter.date}
            icon={<AiTwotoneCalendar size={16} />}
            onClick={(event: any) => {
              ga.event({
                action: 'web_event_월별옵션클릭',
                event_category: 'web_event',
                event_label: '검색',
              });
              setFilter({ ...filter, date: event.target.innerText });
              if (event.target.innerText === '전체') {
                router.replace(`/events`);
              } else {
                const date = event.target.innerText.replace(/[\t\s]/g, '').split(/[년, 월]/);
                router.replace(`/events?year=${date[0]}&month=${date[1]}`);
              }
            }}
          ></Dropdown>
        </span>
        <span className={cn('wrapper')}>
          <Dropdown
            options={getTagList()}
            placeholder="태그"
            icon={<BiPurchaseTagAlt size={16} />}
            type="expand"
            onClick={(event: any) => {
              ga.event({
                action: 'web_event_태그옵션클릭',
                event_category: 'web_event',
                event_label: '검색',
              });
              if (event.target.innerText === '전체') {
                router.replace(`/events`);
              } else {
                const tag = event.target.innerText.replace(/[\t\s\#]/g, '');
                router.replace(`/events?tag=${tag}`);
              }
            }}
          ></Dropdown>
        </span>
      </div>
    </div>
  );
};

const EventCount = ({ isFiltered, totalCount }: { isFiltered: boolean; totalCount: Number }) => {
  return isFiltered ? (
    <span className={cn('section__header__desc')}>
      <span>검색결과</span>
    </span>
  ) : (
    <span className={cn('section__header__desc')}>
      현재&nbsp;<span>{totalCount}개</span>의 개발자 행사 진행 중
    </span>
  );
};

export default EventHeader;
