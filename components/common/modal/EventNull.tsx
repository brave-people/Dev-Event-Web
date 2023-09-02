import React, { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import classNames from 'classnames/bind';
import style from 'components/common/modal/EventNull.module.scss'
import axios from 'axios';
import { TagResponse } from 'model/tag';
import { getRandomTag } from 'lib/utils/tagUtil';
import { EventContext } from 'context/event';
import JobGroupTag from '../tag/JobGroupTag';

const cn = classNames.bind(style)

function EventNull() {
  const [tags, setTags] = useState<TagResponse[] | undefined>([]);
  const { jobGroupList, eventType, location, coast } = useContext(EventContext)
  const fetchTag = async () => {
    try {
      const context = `${jobGroupList?.join(', ')}, ${eventType ? eventType : ""}, ${location ? location : ""}, ${coast ? coast : ""}`;
      const res = await axios.get(`${process.env.BASE_SERVER_URL}/front/v1/events/tags`);
      const result = getRandomTag(res.data, context);
      setTags(result);
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    fetchTag();
    return () => setTags(undefined)
  }, [])
  return (
    <section className={cn('section__list')}>
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
          {tags?.map((tag) => {
            return (
              <JobGroupTag
                key={tag.id}
                tagName={tag.tag_name}
                type="recommand"
              />
            )
          })}
        </div>
      </section>
    </section>
  )
}

export default EventNull;