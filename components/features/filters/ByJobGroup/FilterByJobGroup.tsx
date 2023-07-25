import React, { useEffect, useContext } from "react";
import classNames from "classnames/bind";
import style from './FilterByJobGroup.module.scss'
import Tag from "components/common/tag/Tag";
import { jobGroups } from "../jobGroup";
import { UrlContext } from "types/UrlContext";
import { EventContext } from "context/event";
import { useRouter } from "next/router";

const cn = classNames.bind(style);

type Props = {
  context: UrlContext | undefined;
}

function FilterByJobGroup({ context }: Props) {
  const router = useRouter();
  const { updateJobGroupList } = useContext(EventContext);
  const reflactTagList = () => {
    let temp: string[] = [];

    if (context?.tagList === undefined)
      return ;
    for (let i = 0; i < context.tagList.length; i++) {
      temp.push(decodeURIComponent(context.tagList[i]))
      updateJobGroupList(temp);
    }
  }
  useEffect(() => {
    if (router.asPath !== "/events") {
      reflactTagList();
    }
  }, [])
  
  return (
    <div className={cn('taglist')}>
      {jobGroups?.map((tag) => {
        return (
          <Tag
            key={tag.tag_id}
            tagName={tag.tag_name}
          />
        )
      })}
    </div>
  )
}

export default FilterByJobGroup;