import { Tag } from "model/tag"
import { jobGroups } from 'components/features/filters/jobGroup';

export const getTagName = (tagList: Tag[], tagType: string) => {
  for (let i = 0; i < tagList.length; i++) {
    if (getTagType(tagList[i].tag_name) === tagType)
    return (tagList[i].tag_name);
  }
}

export const getTagType = (label: string) => {
  if (label === '온라인' || label === '오프라인')
    return ('location');
  else if (label === '무료' || label === '유료')
    return ('coast');
  else if (jobGroups.toString().includes(label))
    return ('jobGroup');
  return ('eventType');
}