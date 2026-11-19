import { Event } from 'model/event';
import { TagResponse } from 'model/tag';
import {
  checkCondition,
  checkEventDone,
  getEventEndDate,
} from 'lib/utils/eventUtil';

// 추천 태그 후보: 지금 목록에서 종료되지 않았고 고른 필터를 통과한 행사에 실제로 붙어 있는 태그.
// 누르면 필터는 그대로 두고 검색어만 바뀌므로, 이렇게 골라야 눌렀을 때 결과가 나온다.
// 이미 고른 필터와 같은 태그는 뺀다.
export const getRecommendableTags = (
  events: Event[],
  selectedJobGroups: string | undefined,
  selectedEventType: string | undefined,
  selectedLocation: string | undefined,
  selectedCoast: string | undefined
) => {
  const isSelected = (tagName: string) =>
    (selectedJobGroups !== undefined && selectedJobGroups.includes(tagName)) ||
    selectedEventType === tagName ||
    selectedLocation === tagName ||
    selectedCoast === tagName;

  const tags = new Map<string, TagResponse>();
  events
    .filter(
      (event) =>
        !checkEventDone({ endDate: getEventEndDate(event) }) &&
        checkCondition(
          selectedJobGroups,
          selectedEventType,
          selectedLocation,
          selectedCoast,
          event
        )
    )
    .forEach((event) =>
      event.tags.forEach((tag) => {
        if (!isSelected(tag.tag_name)) tags.set(tag.tag_name, tag);
      })
    );
  return Array.from(tags.values());
};

// 후보 중 서로 다른 태그를 무작위로 최대 3개 고른다
export const getRandomTag = (tags: TagResponse[]) => {
  const shuffled = [...tags];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
};
