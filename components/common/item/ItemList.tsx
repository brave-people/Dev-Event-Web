import style from 'components/common/item/ItemList.module.scss';
import List from 'components/common/item/List';
import { WindowContext } from 'context/window';
import {
  checkCondition,
  checkEventDone,
  getEventEndDate,
} from 'lib/utils/eventUtil';
import { checkSearch } from 'lib/utils/searchUtil';
import { Event, EventResponse } from 'model/event';
import React, { useContext, useMemo } from 'react';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';
import EventNull from '../modal/EventNull';

const cn = classNames.bind(style);

type Props = {
  events: EventResponse[] | undefined;
  isError?: boolean;
  jobGroups?: string;
  eventType?: string;
  location?: string;
  coast?: string;
  search?: string;
};

const passes = (
  item: Event,
  jobGroups: string | undefined,
  eventType: string | undefined,
  location: string | undefined,
  coast: string | undefined,
  search: string | undefined,
  asPath: string
) =>
  !checkEventDone({
    endDate: getEventEndDate({
      start_date_time: item.start_date_time,
      end_date_time: item.end_date_time,
      use_start_date_time_yn: item.use_start_date_time_yn,
      use_end_date_time_yn: item.use_end_date_time_yn,
    }),
  }) &&
  checkCondition(jobGroups, eventType, location, coast, item) &&
  checkSearch(search, asPath, item);

function ItemList({
  events,
  isError,
  jobGroups,
  eventType,
  location,
  coast,
  search,
}: Props) {
  const { modalState } = useContext(WindowContext);
  const router = useRouter();

  // 월 그룹별 필터 결과 (SSR에서도 동기 계산됨)
  const groups = useMemo(
    () =>
      (events ?? []).filter(Boolean).map((group) => ({
        metadata: group.metadata,
        items: group.dev_event.filter((item) =>
          passes(
            item,
            jobGroups,
            eventType,
            location,
            coast,
            search,
            router.asPath
          )
        ),
      })),
    [events, jobGroups, eventType, location, coast, search, router.asPath]
  );

  const searchRes = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups]
  );
  const eventCount = searchRes.length;

  if (isError) {
    return (
      <div className={cn('null-container')}>
        이벤트 정보를 불러오는데 문제가 발생했습니다!
      </div>
    );
  }

  return (
    <>
      {search && modalState.currentModal === 0 && (
        <>
          <div className={cn('search__header')}>
            <span className={cn('list__title')}>{`${search}`}</span>
            <span className={cn('total__count')}>{searchRes.length}</span>
          </div>
          <div className={cn('search__list')}>
            {searchRes.length !== 0 ? (
              <List data={searchRes} parentLast={true} eagerCount={4} />
            ) : (
              <EventNull />
            )}
          </div>
        </>
      )}
      {search && modalState.currentModal === 1 && (
        <>
          <div className={cn('search__header__modal')}>
            <div className={cn('list__title')}>`{`${search}`}` 검색결과</div>
            <div className={cn('total__count')}>{searchRes.length}개</div>
          </div>
          <div className={cn('search__list')}>
            {searchRes.length !== 0 ? (
              <List data={searchRes} parentLast={true} eagerCount={4} />
            ) : (
              <EventNull />
            )}
          </div>
        </>
      )}
      {!search &&
        events &&
        groups.map((group, index) =>
          group.items.length !== 0 ? (
            <div key={index} className={cn('section__list')}>
              <div className={cn('list__title')}>
                <span>{`${group.metadata.year}년 ${group.metadata.month}월`}</span>
              </div>
              <List
                data={group.items}
                parentLast={false}
                eagerCount={index === 0 ? 4 : 0}
              />
            </div>
          ) : null
        )}
      {!search && !events && <EventNull />}
      {/* 행사 조회 결과가 없을떄 */}
      {eventCount === 0 &&
        modalState.currentModal === 0 &&
        search === undefined && <EventNull />}
    </>
  );
}

export default ItemList;
