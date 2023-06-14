import React, { useEffect, useState } from "react";
import { getTagsApi } from "lib/api/handler";
import { TagResponse } from "model/tag";
import classNames from "classnames/bind";
import style from './FilterByJobGroup.module.scss'
import Tag from "components/common/tag/Tag";

const cx = classNames.bind(style);

function FilterByJobGroup() {
  const [tagList, setTagList] = useState<TagResponse[] | undefined>(undefined);
  const fetchTagList = async () => {
    const result = await getTagsApi("/front/v1/events/tags");
    console.log(result);
    setTagList(result);
  }
  useEffect(() => {
    fetchTagList();
  }, []);
  return (
    <div className={cx('taglist')}>
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