import React, { useContext, useEffect } from "react";
import { EventContext } from "context/event";
import classNames from "classnames/bind";
import style from './Tag.module.scss';
import { useRouter } from "next/router";
import { parseUrl } from "lib/utils/UrlUtil";

type Prop = {
  tagName: string;
}

const cx = classNames.bind(style);

function Tag({ tagName }: Prop) {
  const router = useRouter();
  const { jobGroupList, updateJobGroupList, deleteJobGroupList } = useContext(EventContext);
  const handleOnClick = () => {
    handleJobGroupList(tagName);
  }
  const handleJobGroupList = (tag: string) => {
    if (jobGroupList !== undefined) {
      jobGroupList.includes(tag)
      ? deleteJobGroupList(tag)
      : updateJobGroupList(tag)
    } else {
     updateJobGroupList(tag); 
    }
  }
  useEffect(() => {

  }, [jobGroupList])
  return (
    <div
      onClick={() => {
        const key = "tag";
        const value = tagName;
        router.replace(`${parseUrl(`${router.asPath}`, key, value, jobGroupList)}`)
        handleOnClick();
      }}
      className={cx('tag', `${jobGroupList && jobGroupList.includes(tagName) && 'checked'}`)}>
      {tagName}
    </div>   
  )
}

export default Tag;