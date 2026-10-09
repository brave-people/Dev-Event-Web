import { Event } from 'model/event';
import { reflactUrlContext, safeDecode } from './UrlUtil';

// 대소문자·전각/반각·자모 분리(NFD)·띄어쓰기 차이로 같은 글자를 놓치지 않도록 비교 전에 맞춘다
// (공백은 모두 지워서 '카카오테크'로 '카카오 테크'를 찾을 수 있게 한다)
const normalizeText = (text: string) =>
  text.normalize('NFKC').toLowerCase().replace(/\s+/g, '');

const matchesKeyword = (event: Event, keyword: string) => {
  const target = normalizeText(keyword);
  const fields = [
    event.title,
    event.organizer,
    ...event.tags.map((tag) => tag.tag_name),
  ];
  return fields.some((field) => normalizeText(field).includes(target));
};

// 숫자 키패드 Enter(code 'NumpadEnter')나 code가 비어 오는 모바일 가상 키보드도 key는 'Enter'다.
// 한글 조합 중 Enter는 브라우저에 따라 key가 'Process'로 오므로 code도 함께 본다.
export const isEnterKey = ({ key, code }: { key: string; code: string }) =>
  key === 'Enter' || code === 'Enter';

export const checkSearch = (
  search: string | undefined,
  url: string,
  event: Event
) => {
  if (search !== undefined) return matchesKeyword(event, search);
  if (url.includes('/events')) return true;

  const { kwd } = reflactUrlContext(url);
  if (kwd === undefined) return true;
  return matchesKeyword(event, safeDecode(kwd));
};
