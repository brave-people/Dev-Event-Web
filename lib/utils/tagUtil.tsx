import { eventType } from 'components/features/filters/eventType';
import { jobGroups } from 'components/features/filters/jobGroup';
import { Tag, TagResponse } from 'model/tag';

export const getTagName = (tagList: Tag[], tagType: string) => {
  for (let i = 0; i < tagList.length; i++) {
    if (getTagType(tagList[i].tag_name) === tagType) return tagList[i].tag_name;
  }
};

export const getTagType = (label: string) => {
  if (label === '온라인' || label === '오프라인') return 'location';
  else if (label === '무료' || label === '유료') return 'coast';
  else if (JSON.stringify(jobGroups).includes(label)) return 'jobGroup';
  else if (eventType.includes(label)) return 'eventType';
  return undefined;
};

export const getRandomTag = (tags: TagResponse[], context: string) => {
  let randomNumArray: number[] = [];
  let randomTag: TagResponse[] = [];
  const filterDup = tags.filter((tag) => {
    return context.includes(tag.tag_name) !== true;
  });
  let i = 0;
  while (i < 3) {
    let randomNum = Math.floor(Math.random() * filterDup?.length);
    if (randomNumArray.includes(randomNum) === false) {
      randomNumArray.push(randomNum);
      i++;
    }
  }
  for (let i = 0; i < 3; i++) {
    randomTag.push(filterDup[randomNumArray[i]]);
  }
  return randomTag;
};
