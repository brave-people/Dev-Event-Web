import { marked } from 'marked';
import { escapeAttrValue, FilterXSS, friendlyAttrValue, IWhiteList } from 'xss';

/**
 * 본문에 남겨 둘 태그와 속성. 마크다운(GFM)이 만들어 내는 요소만 허용한다.
 * 여기에 없는 태그는 지우고(안의 글자는 남김), 없는 속성은 버린다.
 * 체크박스(<input>)는 marked가 만든 모양만 따로 통과시킨다 (onTag 참고).
 */
const ALLOW_LIST: IWhiteList = {
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  h5: ['id'],
  h6: ['id'],
  p: [],
  br: [],
  hr: [],
  ul: [],
  ol: ['start'],
  li: [],
  blockquote: [],
  pre: [],
  code: ['class'],
  strong: [],
  em: [],
  del: [],
  a: ['href', 'title'],
  img: ['src', 'alt', 'title'],
  table: [],
  thead: [],
  tbody: [],
  tr: [],
  th: ['align'],
  td: ['align'],
};

/**
 * 브라우저가 안의 내용을 화면에 그리지 않는 태그. 여는 태그부터 닫는 태그까지
 * (닫는 태그가 없으면 그 HTML 조각 끝까지) 통째로 지워 코드가 글자로 보이지 않게 한다.
 * 보기 좋게 하려는 처리일 뿐이고, 여기서 놓친 태그도 뒤의 필터가 지운다.
 */
const HIDDEN_BODY =
  /<(script|style|iframe|noscript|template|title)(?=[\s/>])[\s\S]*?(?:<\/\1\s*>|$)/gi;

/**
 * 주소는 "이 글자로 시작하면 허용" 방식으로만 검사한다.
 * `javascript:`를 찾아 막는 방식은 엔티티를 겹쳐 쓰는 수법(`&#38;#58;`)에 뚫린다.
 */
const LINK_URL = /^(https?:\/\/|mailto:|[/#?]|\.\.?\/)/i;
const IMAGE_URL = /^(https?:\/\/|\/|\.\.?\/)/i;
/** 사이트 안 주소(`/events`, `#id`, `?q=`, `./a`)와 메일. 그 밖의 링크는 바깥 링크로 본다. */
const INTERNAL_HREF = /^(mailto:|[#?]|\/(?![/\\])|\.\.?\/)/i;
const EXTERNAL_REL = 'noopener noreferrer';

/** 값이 정해진 모양일 때만 남기는 속성. */
const ATTR_VALUE_RULES: Record<string, RegExp> = {
  align: /^(left|center|right)$/,
  start: /^\d{1,9}$/,
  class: /^language-\S+$/,
};

/** marked가 할 일 목록(`- [ ]`, `- [x]`)에 만드는 체크박스 태그 그대로일 때만 통과. */
const TASK_CHECKBOX = /^<input (checked="" )?disabled="" type="checkbox">$/;

/**
 * 1단계 — 설명에 직접 쓴 HTML에서는 줄바꿈(<br>)만 남긴다.
 * 여닫는 태그를 통과시키면 닫히지 않은 <a>·<table>이 서버 렌더링 HTML에서
 * 본문 뒤의 화면(푸터 등)까지 삼키므로, 짝이 필요 없는 <br>만 허용한다.
 */
const rawHtmlFilter = new FilterXSS({
  whiteList: { br: [] },
  stripIgnoreTag: true,
  css: false,
});

/** 2단계 — 변환이 끝난 HTML 전체를 허용 목록으로 다시 거른다. */
const outputFilter = new FilterXSS({
  whiteList: ALLOW_LIST,
  stripIgnoreTag: true,
  css: false,
  onTag: (tag, html) => {
    if (tag !== 'input') return undefined;
    return TASK_CHECKBOX.test(html) ? html : '';
  },
  onTagAttr: (tag, name, value, isWhiteAttr) => {
    // 허용 목록에 없는 속성(on*, style, class 등)은 xss 기본 처리에 맡겨 버린다.
    if (!isWhiteAttr) return undefined;

    // 엔티티·제어 문자를 푼 값으로 검사하고, 그 값을 다시 이스케이프해서 내보낸다.
    const decoded = friendlyAttrValue(value);

    if (name === 'href') {
      if (!LINK_URL.test(decoded)) return '';
      const href = `href="${escapeAttrValue(decoded)}"`;
      return INTERNAL_HREF.test(decoded)
        ? href
        : `${href} rel="${EXTERNAL_REL}"`;
    }
    if (name === 'src') {
      return IMAGE_URL.test(decoded) ? `src="${escapeAttrValue(decoded)}"` : '';
    }

    const rule = ATTR_VALUE_RULES[name];
    if (rule && !rule.test(decoded)) return '';
    return undefined;
  },
});

class DescriptionRenderer extends marked.Renderer {
  /** 설명에 직접 쓴 HTML(블록·인라인 모두)이 지나가는 곳. */
  html(html: string): string {
    return rawHtmlFilter.process(html.replace(HIDDEN_BODY, ''));
  }
}

class DescriptionTokenizer extends marked.Tokenizer {
  /**
   * marked는 <pre>·<code>·<kbd>·<script> 태그 사이의 글자를 이스케이프하지 않고 내보낸다.
   * 그 상태(inRawBlock)에 들어가지 않게 해서 글자는 언제나 이스케이프되게 한다.
   */
  tag(this: marked.Tokenizer & marked.TokenizerThis, src: string) {
    const token = marked.Tokenizer.prototype.tag.call(this, src);
    this.lexer.state.inRawBlock = false;
    return token;
  }
}

const renderer = new DescriptionRenderer();
const tokenizer = new DescriptionTokenizer();

/**
 * 행사 설명(마크다운)을 화면에 넣어도 안전한 HTML로 바꾼다.
 *
 * marked는 마크다운 안의 HTML과 `javascript:` 링크를 그대로 통과시키므로,
 * 직접 쓴 HTML은 <br>만 남기고, 변환 결과를 허용 목록으로 한 번 더 걸러낸다.
 * DOM 없이 문자열만 다루기 때문에 서버 렌더링과 브라우저에서 같은 결과가 나온다.
 */
export const renderDescription = (markdown?: string | null): string => {
  if (typeof markdown !== 'string' || markdown.trim() === '') return '';

  const html = marked(markdown, {
    breaks: true, // 줄바꿈을 <br>로 변환
    gfm: true, // GitHub Flavored Markdown 지원
    mangle: false, // 메일 주소를 무작위 엔티티로 바꾸지 않는다 (호출마다 결과가 달라짐)
    renderer,
    tokenizer,
  });

  return outputFilter.process(html);
};
