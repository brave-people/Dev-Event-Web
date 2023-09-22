import JobGroupTag from 'components/common/tag/JobGroupTag';
import style from 'components/features/filters/ByJobGroup/FilterByJobGroup.module.scss';
import { jobGroups } from 'components/features/filters/jobGroup';
import { EventContext } from 'context/event';
import { UrlContext } from 'types/Context';
import React, { useEffect, useContext } from 'react';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

type Props = {
  context: UrlContext | undefined;
};

function FilterByJobGroup({ context }: Props) {
  const router = useRouter();
  const { updateJobGroupList } = useContext(EventContext);
  const reflactTagList = () => {
    const temp: string[] = [];

    if (context?.tagList === undefined) return;
    for (let i = 0; i < context.tagList.length; i++) {
      temp.push(decodeURIComponent(context.tagList[i]));
      updateJobGroupList(temp);
    }
  };
  useEffect(() => {
    if (router.asPath !== '/events') {
      reflactTagList();
    }
  }, []);

  return (
    <div className={cn('taglist')}>
      {jobGroups?.map((tag) => {
        return <JobGroupTag key={tag.tag_id} tagName={tag.tag_name} type="basic" />;
      })}
    </div>
  );
}

export default FilterByJobGroup;
