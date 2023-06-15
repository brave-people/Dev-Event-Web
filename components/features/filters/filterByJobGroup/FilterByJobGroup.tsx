import React, { useState } from "react";
import classNames from "classnames/bind";
import style from './FilterByJobGroup.module.scss'
import Tag from "components/common/tag/Tag";
import { TagResponse } from "model/tag";

const cn = classNames.bind(style);

type Props = {
  tagList: TagResponse[] | undefined;
}

function FilterByJobGroup({ tagList }: Props) {
  return (
    <div className={cn('taglist')}>
      {tagList?.map((tag) => {
        return (
          <Tag
            key={tag.id}
            tagName={tag.tag_name}
          />
        )
      })}
    </div>
  )
}

export default FilterByJobGroup;