import React, { useContext } from "react";
import { EventContext } from "context/event";
import classNames from "classnames/bind";
import style from './JobTag.module.scss';

type Prop = {
  tagName: string;
}

const cx = classNames.bind(style);

function Tag({ tagName }: Prop) {
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
  return (
    <div
      onClick={handleOnClick}
      className={cx('tag',
      `${jobGroupList?.includes(tagName) && 'checked'}`)}>
      {tagName}
    </div>   
  )
}

export default Tag;