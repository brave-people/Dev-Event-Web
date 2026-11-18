import { marked } from 'marked';

// 걸러내기(XSS 방지)는 `claude/frosty-murdock-4b230c` 브랜치의 같은 경로 파일이 맡는다.
// 합칠 때 그쪽 파일로 통째로 바꾼다. 시그니처가 같아 부르는 쪽
// (`components/events/detail/DetailBody.tsx`)은 고칠 것이 없다.

// 본문(마크다운)을 HTML로 바꾼다. 비었거나 공백뿐이면 ''.
export const renderDescription = (markdown?: string | null): string => {
  if (typeof markdown !== 'string' || !markdown.trim()) return '';
  return marked(markdown, {
    breaks: true, // 줄바꿈을 <br>로 변환
    gfm: true, // GitHub Flavored Markdown 지원
  });
};
