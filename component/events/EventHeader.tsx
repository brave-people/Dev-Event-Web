import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import style from 'styles/Home.module.scss';
import Dropdown from 'component/common/dropdown/Dropdown';
import { AiTwotoneCalendar } from 'react-icons/ai';
import { BiPurchaseTagAlt } from 'react-icons/bi';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { useScheduledEvents, useTags } from 'lib/hooks/useSWR';

const cn = classNames.bind(style);

const EventHeader = () => {
  const router = useRouter();
  const [filter, setFilter] = useState({ date: '전체', tag: '태그' });
  const { tags, isLoading, isError } = useTags();

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
    const list = tags?.map((tag) => {
      return tag.tag_name;
    });
    return list;
  };

  return (
    <div className={cn('section__header')}>
      <EventCount />
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

const EventCount = () => {
  const [totalCount, setTotalCount] = useState(0);
  const { scheduledEvents, isLoading, isError } = useScheduledEvents();

  useEffect(() => {
    const result = scheduledEvents?.reduce(function add(sum, currValue) {
      return sum + currValue.metadata.total;
    }, 0);

    setTotalCount(result || 0);
  }, [scheduledEvents]);

  return (
    <span className={cn('section__header__desc')}>
      {' '}
      현재 <span>{totalCount}개</span>의 개발자 행사 진행 중
    </span>
  );
};

export default EventHeader;
