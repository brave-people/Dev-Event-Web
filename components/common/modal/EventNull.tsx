import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import classNames from 'classnames/bind';
import style from 'components/common/modal/EventNull.module.scss'
import { TagResponse } from 'model/tag';
import { getRandomTag } from 'lib/utils/tagUtil';
import { EventContext } from 'context/event';
import JobGroupTag from 'components/common/tag/JobGroupTag';
import { useTags } from 'lib/hooks/useSWR';

const cn = classNames.bind(style)

function EventNull() {
  const [randomTags, setRandomTags] = useState<TagResponse[]>([]);
  const { jobGroupList, eventType, location, coast } = useContext(EventContext)
  const { tags } = useTags();

  useEffect(() => {
    if (tags !== undefined) {
      const context = `${jobGroupList?.join(', ')}, ${eventType ? eventType : ""}, ${location ? location : ""}, ${coast ? coast : ""}`;
      setRandomTags(getRandomTag(tags, context));
    }
    console.log("Hello, World");
  }, [jobGroupList, eventType, location, coast])
  
  return (
    <section className={cn('section__list')}>
      {randomTags && randomTags.length !== 0 && (
      <section className={cn('container')}>
        <div className={cn('title')}>
          찾으시는 행사정보가 없어요
        </div>
        <Image
          src={"/icon/none_event.svg"}
          alt='no event'
          priority={true}
          width={58}
          height={58}
        />
        <div className={cn('desc')}>
          추천태그로 검색해보세요
        </div>
        <div className={cn('tag__container')}>
          {randomTags.map((tag) => {
            return (
              <JobGroupTag
                key={tag.id}
                tagName={tag.tag_name}
                type="recommand"
                parent={false}
              />
            )
          })}
        </div>
      </section>
      )}
    </section>
  )
}

export default EventNull;