import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames/bind';
import style from 'components/common/modal/EventNull.module.scss';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import { getRandomTag, getRecommendableTags } from 'lib/utils/tagUtil';
import { EventContext } from 'context/event';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { parseUrl } from 'lib/utils/UrlUtil';

const cn = classNames.bind(style);

type Props = {
  events: Event[];
};

function EventNull({ events }: Props) {
  const [randomTags, setRandomTags] = useState<TagResponse[] | undefined>(
    undefined
  );
  const router = useRouter();
  const { jobGroupList, eventType, location, coast } = useContext(EventContext);
  const candidates = useMemo(
    () =>
      getRecommendableTags(
        events,
        jobGroupList?.join(', '),
        eventType,
        location,
        coast
      ),
    [events, jobGroupList, eventType, location, coast]
  );

  // 무작위 선택은 서버 렌더 결과와 달라지지 않도록 마운트 뒤에 한다
  useEffect(() => {
    setRandomTags(getRandomTag(candidates));
    return () => {
      setRandomTags(undefined);
    };
  }, [candidates]);

  return (
    <div className={cn('empty')} role="status">
      <div className={cn('icon')}>
        <TimelineIcon name="search" size={32} />
      </div>
      <b className={cn('title')}>찾으시는 행사정보가 없어요</b>
      {candidates.length !== 0 && (
        <p className={cn('desc')}>추천 태그로 검색해 보세요</p>
      )}
      {randomTags && randomTags.length !== 0 && (
        <div className={cn('tags')}>
          {randomTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={cn('tag')}
              onClick={() => {
                router.push(
                  parseUrl(router.asPath, 'kwd', tag.tag_name, jobGroupList),
                  undefined,
                  { scroll: false }
                );
              }}
            >
              {tag.tag_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventNull;
