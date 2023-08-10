import { Event } from "model/event"

export const checkSearch = (search: string | undefined, event: Event) => {
  if (search === undefined)
    return (false);
  if (event.title.includes(search) || event.description.includes(search) || event.organizer.includes(search))
    return (true);
  const eventTag = event.tags;
  for (let i = 0; i < eventTag.length; i++) {
    if (eventTag[i].tag_name.includes(search))
      return (true);
  }
  return (false);
}