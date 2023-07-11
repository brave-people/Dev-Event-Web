import React, { useContext, useEffect } from "react";
import { EventContext } from "context/event";
import classNames from "classnames/bind";
import style from './Tag.module.scss';
import { useRouter } from "next/router";
import { parseUrl } from "lib/utils/urlUtil";
import { WindowContext } from "context/window";

type Prop = {
  tagName: string;
}

const cx = classNames.bind(style);

function Tag({ tagName }: Prop) {
  const router = useRouter();
  const { jobGroupList, updateJobGroupList, deleteJobGroupList } = useContext(EventContext);
  const { windowTheme } = useContext(WindowContext);
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
  return (
    <div
      onClick={() => {
        const key = "tag";
        const value = tagName;
        router.replace(`${parseUrl(`${router.asPath}`, key, value, jobGroupList)}`)
        handleOnClick();
      }}
      className={cx(
        'tag',
        windowTheme ? 'tag--light' : 'tag--dark', 
        `${jobGroupList && jobGroupList.includes(tagName) 
        && (windowTheme ? 'checked--light' : 'checked--dark')}`)}>
      {tagName}
    </div>   
  )
}

export default Tag;