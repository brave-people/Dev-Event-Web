import { Event } from 'model/event';
import { reflactUrlContext } from './UrlUtil';

export const checkSearch = (
  search: string | undefined,
  url: string,
  event: Event
) => {
  const context = reflactUrlContext(url);
  if (search === undefined) {
    if (url.includes('/events') || url.includes('kwd') === false) {
      return true;
    } else {
      if (context.kwd) {
        const kwd = decodeURIComponent(context.kwd);

        if (event.title.includes(kwd) || event.organizer.includes(kwd))
          return true;

        const eventTag = event.tags;
        for (let i = 0; i < eventTag.length; i++) {
          if (eventTag[i].tag_name.includes(kwd)) return true;
        }
      } else return false;
    }
  } else {
    if (event.title.includes(search) || event.organizer.includes(search))
      return true;

    const eventTag = event.tags;
    for (let i = 0; i < eventTag.length; i++) {
      if (eventTag[i].tag_name.includes(search)) return true;
    }
  }
  return false;
};
