import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Dropdown from 'component/common/dropdown/Dropdown';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { BiPurchaseTagAlt } from 'react-icons/bi';
import { MdOutlineReplay } from 'react-icons/md';
import router, { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useScheduledEvents, useTags } from 'lib/hooks/useSWR';

const cn = classNames.bind(style);

const EventHeader = () => {
  const router = useRouter();
  const [filter, setFilter] = useState({ date: '전체', tag: '태그' });
  const [isFiltered, setIsFiltered] = useState(false);
  const { tags, isLoading, isError } = useTags();

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

  const getDateList = () => {
    const list = ['전체'];
    let currentDate = dayjs().endOf('month');
    const startDate = dayjs('2022-01-01');
    while (startDate.isBefore(currentDate)) {
      list.push(currentDate.format('YYYY년 MM월'));
      currentDate = currentDate.subtract(1, 'M');
    }
    return list;
  };

  const getTagList = () => {
    if (tags && !isError) {
      const list = tags?.map((tag) => {
        return tag.tag_name;
      });
      return list;
    }
    return [];
  };

  return (
    <div className={cn('section__header')}>
      <EventCount isFiltered={isFiltered} />
      <div className={cn('section__header__filters')}>
        <Dropdown
          options={getDateList()}
          placeholder="전체"
          value={filter.date}
          icon={<AiTwotoneCalendar size={16} />}
          onClick={(event: any) => {
            setFilter({ ...filter, date: event.target.innerText });
            if (event.target.innerText === '전체') {
              router.replace(`/events`);
            } else {
              const date = event.target.innerText.replace(/[\t\s]/g, '').split(/[년, 월]/);
              router.replace(`/events?year=${date[0]}&month=${date[1]}`);
            }
          }}
        ></Dropdown>
        <span className={cn('wrapper')}>
          <Dropdown
            options={getTagList()}
            placeholder="태그"
            icon={<BiPurchaseTagAlt size={16} />}
            type="expand"
            onClick={(event: any) => {
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

const EventCount = ({ isFiltered }: { isFiltered: boolean }) => {
  const [totalCount, setTotalCount] = useState(0);
  const { scheduledEvents, isLoading, isError } = useScheduledEvents();

  useEffect(() => {
    if (scheduledEvents && !isError) {
      const result = scheduledEvents.reduce(function add(sum, currValue) {
        return sum + currValue.metadata.total;
      }, 0);
      setTotalCount(result);
    }
  }, [scheduledEvents]);

  return isFiltered ? (
    <span className={cn('section__header__desc')}>
      <span>검색결과</span>
      <div
        className={cn('reset-button')}
        onClick={(event) => {
          router.replace(`/events`);
        }}
      >
        <MdOutlineReplay size={20} />
      </div>
    </span>
  ) : (
    <span className={cn('section__header__desc')}>
      현재&nbsp;<span>{totalCount}개</span>의 개발자 행사 진행 중
    </span>
  );
};

export default EventHeader;
