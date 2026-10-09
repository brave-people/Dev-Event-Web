import React, { useState, useEffect, useContext, useMemo } from 'react';
import Image from 'next/image';
import classNames from 'classnames/bind';
import style from 'components/common/modal/EventNull.module.scss';
import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import { getRandomTag, getRecommendableTags } from 'lib/utils/tagUtil';
import { EventContext } from 'context/event';
import JobGroupTag from 'components/common/tag/JobGroupTag';

const cn = classNames.bind(style);

type Props = {
  events: Event[];
};

function EventNull({ events }: Props) {
  const [randomTags, setRandomTags] = useState<TagResponse[] | undefined>(
    undefined
  );
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
    <section className={cn('section__list')}>
      <section className={cn('container')}>
        <div className={cn('title')}>찾으시는 행사정보가 없어요</div>
        <Image
          src={'/icon/none_event.svg'}
          alt="no event"
          priority={true}
          width={58}
          height={58}
        />
        {candidates.length !== 0 && (
          <div className={cn('desc')}>추천태그로 검색해보세요</div>
        )}
        {randomTags && randomTags.length !== 0 && (
          <div className={cn('tag__container')}>
            {randomTags.map((tag) => {
              return (
                <JobGroupTag
                  key={tag.id}
                  tagName={tag.tag_name}
                  type="recommand"
                  parent={false}
                />
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}

export default EventNull;
