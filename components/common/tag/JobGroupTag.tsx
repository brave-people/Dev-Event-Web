import React, { useContext, useCallback } from "react";
import { EventContext } from "context/event";
import classNames from "classnames/bind";
import style from 'components/common/tag/JobGroupTag.module.scss';
import { useRouter } from "next/router";
import { initUrl, parseUrl } from "lib/utils/urlUtil";
import { WindowContext } from "context/window";

type Prop = {
  tagName: string;
  type: string;
  parent: boolean;
}

const cx = classNames.bind(style);

function JobGroupTag({ tagName, type, parent }: Prop) {
  const router = useRouter();
  const { jobGroupList, eventType, location, coast, search, date, url, updateJobGroupList, deleteJobGroupList, initJobGroupList, handleDate, handleUrl } = useContext(EventContext);
  const { windowTheme } = useContext(WindowContext);
  const handleOnClick = () => {
    handleJobGroupList(tagName);
  }
  const handleJobGroupList = (tag: string) => {
    if (parent) {
      if (jobGroupList !== undefined) {
        jobGroupList.includes(tag)
        ? deleteJobGroupList(tag)
        : updateJobGroupList(tag)
      } else {
       updateJobGroupList(tag); 
      }
    }
  }

  const reflactUrl = (urls: string) => {
    const windowX = window.innerWidth;
    handleUrl(urls);
    if (windowX < 600 && parent)
      return ;
    router.replace(urls);
  }

  const handleInit = useCallback(() => {
    initJobGroupList();
  }, []);
  return (
    <div
      onClick={() => {
        const key = parent ? "tag" : "kwd";
        const value = tagName;
        if (date !== undefined)
          handleDate(undefined);
        if (value === "전체") {
          reflactUrl(`${initUrl(`${url ? url : router.asPath}`, key, jobGroupList, eventType, location, coast, search)}`)
          handleInit();
        } else {
          reflactUrl(`${parseUrl(`${url ? url : router.asPath}`, key, value, jobGroupList)}`)
          console.log(`${parseUrl(`${url ? url : router.asPath}`, key, value, jobGroupList)}`);
          handleOnClick();
        }
      }}
      className={cx(
        'tag',
        windowTheme ? 'tag--light' : 'tag--dark', 
        `${(jobGroupList && jobGroupList.includes(tagName) 
        || (jobGroupList === undefined || jobGroupList.length === 0) && tagName === "전체")
        && (windowTheme ? 'checked--light' : 'checked--dark')}`)}>
      {type === "basic" ? `${tagName}` : `#${tagName}`}
    </div>   
  )
}

export default JobGroupTag;