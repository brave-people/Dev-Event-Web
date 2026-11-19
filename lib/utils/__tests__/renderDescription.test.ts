import { renderDescription } from 'lib/utils/renderDescription';

/** 결과 HTML을 브라우저가 해석하는 방식(jsdom의 HTML5 파서)으로 읽는다. */
const toDom = (html: string): HTMLElement => {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
};

const render = (markdown: string): HTMLElement =>
  toDom(renderDescription(markdown));

// 태그별로 남아도 되는 속성. 여기에 없는 태그·속성이 결과에 있으면 실패한다.
const ALLOWED: Record<string, string[]> = {
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
  a: ['href', 'title', 'rel'],
  img: ['src', 'alt', 'title'],
  table: [],
  thead: [],
  tbody: [],
  tr: [],
  th: ['align'],
  td: ['align'],
  input: ['type', 'checked', 'disabled'],
};

const SAFE_HREF = /^(https?:\/\/|mailto:|\/|#|\?|\.\.?\/)/i;
const SAFE_SRC = /^(https?:\/\/|\/|\.\.?\/)/i;

/** 허용 목록 밖의 태그·속성·주소가 하나라도 남아 있으면 그 내용을 돌려준다. */
const findViolations = (root: HTMLElement): string[] => {
  const violations: string[] = [];
  root.querySelectorAll('*').forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const allowedAttrs = ALLOWED[tag];
    if (!allowedAttrs) {
      violations.push(`<${tag}>`);
      return;
    }
    Array.from(el.attributes).forEach((attr) => {
      if (!allowedAttrs.includes(attr.name)) {
        violations.push(`<${tag} ${attr.name}>`);
      }
    });
    const href = el.getAttribute('href');
    if (href !== null && !SAFE_HREF.test(href)) {
      violations.push(`href=${href}`);
    }
    const src = el.getAttribute('src');
    if (src !== null && !SAFE_SRC.test(src)) {
      violations.push(`src=${src}`);
    }
    if (tag === 'input' && el.getAttribute('type') !== 'checkbox') {
      violations.push('<input> 체크박스 아님');
    }
  });
  return violations;
};

/**
 * 서버 렌더링 HTML처럼 본문 뒤에 다른 화면 요소를 이어 붙여 읽었을 때,
 * 닫히지 않은 태그가 뒤의 요소를 본문 안으로 삼키거나 링크·굵은 글씨로 감싸면 true.
 */
const swallowsFollowingContent = (html: string): boolean => {
  const page = document.createElement('div');
  page.innerHTML = `<div id="box">${html}</div><footer id="after">뒤</footer>`;
  const after = page.children[1];
  return !(
    page.children.length === 2 &&
    page.children[0].id === 'box' &&
    after.id === 'after' &&
    after.children.length === 0 &&
    after.textContent === '뒤'
  );
};

describe('renderDescription — 마크다운 요소는 그대로 통과', () => {
  it('제목은 단계와 id를 유지한다', () => {
    const root = render('# 큰 제목\n\n## 행사 소개\n\n###### 작은 제목');
    expect(root.querySelector('h1')?.textContent).toBe('큰 제목');
    expect(root.querySelector('h2')?.textContent).toBe('행사 소개');
    expect(root.querySelector('h2')?.id).toBe('행사-소개');
    expect(root.querySelector('h6')?.textContent).toBe('작은 제목');
  });

  it('문단 안 줄바꿈은 <br>이 된다', () => {
    const root = render('첫 줄\n둘째 줄\n\n다음 문단');
    expect(root.querySelectorAll('p')).toHaveLength(2);
    expect(root.querySelectorAll('p')[0].querySelectorAll('br')).toHaveLength(
      1
    );
  });

  it('목록(순서 없음·순서 있음·중첩)을 유지한다', () => {
    const root = render('- 하나\n- 둘\n  - 둘의 하나\n\n3. 셋\n4. 넷');
    expect(root.querySelectorAll('ul')).toHaveLength(2);
    expect(root.querySelectorAll('ul ul li')).toHaveLength(1);
    expect(root.querySelector('ol')?.getAttribute('start')).toBe('3');
    expect(root.querySelectorAll('ol > li')).toHaveLength(2);
  });

  it('표는 머리글·본문·정렬과 칸 안의 <br>을 유지한다', () => {
    const root = render(
      [
        '| 시간 | 세션 | 비고 |',
        '| :--- | :---: | ---: |',
        '| 10:00 | **키노트** (홍길동)<br>질의응답 | 무료 |',
        '| 11:00 | 휴식 | - |',
      ].join('\n')
    );
    expect(root.querySelectorAll('table')).toHaveLength(1);
    expect(root.querySelectorAll('thead th')).toHaveLength(3);
    expect(root.querySelectorAll('tbody tr')).toHaveLength(2);
    const aligns = Array.from(root.querySelectorAll('thead th')).map((th) =>
      th.getAttribute('align')
    );
    expect(aligns).toEqual(['left', 'center', 'right']);
    const cell = root.querySelectorAll('tbody tr')[0].querySelectorAll('td')[1];
    expect(cell.querySelector('strong')?.textContent).toBe('키노트');
    expect(cell.querySelectorAll('br')).toHaveLength(1);
  });

  it('그림은 주소·대체 문구·제목을 유지한다', () => {
    const root = render(
      '![행사 포스터](https://example.com/a/poster.png?w=1&h=2 "포스터")'
    );
    const img = root.querySelector('img');
    expect(img?.getAttribute('src')).toBe(
      'https://example.com/a/poster.png?w=1&h=2'
    );
    expect(img?.getAttribute('alt')).toBe('행사 포스터');
    expect(img?.getAttribute('title')).toBe('포스터');
  });

  it('인용·코드·구분선·강조·취소선을 유지한다', () => {
    const root = render(
      [
        '> 인용문',
        '',
        '`인라인 <b>코드</b>`',
        '',
        '```ts',
        'const a = "<script>";',
        '```',
        '',
        '---',
        '',
        '**굵게** *기울임* ~~취소~~',
      ].join('\n')
    );
    expect(root.querySelector('blockquote p')?.textContent).toBe('인용문');
    expect(root.querySelector('p > code')?.textContent).toBe(
      '인라인 <b>코드</b>'
    );
    const fenced = root.querySelector('pre > code');
    expect(fenced?.getAttribute('class')).toBe('language-ts');
    expect(fenced?.textContent).toBe('const a = "<script>";\n');
    expect(root.querySelectorAll('hr')).toHaveLength(1);
    expect(root.querySelector('strong')?.textContent).toBe('굵게');
    expect(root.querySelector('em')?.textContent).toBe('기울임');
    expect(root.querySelector('del')?.textContent).toBe('취소');
    expect(root.querySelector('script')).toBeNull();
    expect(root.querySelector('b')).toBeNull();
  });

  it('할 일 목록의 체크박스는 비활성 상태로 남는다', () => {
    const root = render('- [ ] 신청\n- [x] 결제');
    const boxes = root.querySelectorAll<HTMLInputElement>('li > input');
    expect(boxes).toHaveLength(2);
    expect(boxes[0].checked).toBe(false);
    expect(boxes[1].checked).toBe(true);
    expect(boxes[0].disabled && boxes[1].disabled).toBe(true);
  });

  it('본문 글자는 바뀌지 않는다', () => {
    const root = render('A & B < C > D "따옴표" \'작은따옴표\' 1 &lt; 2');
    expect(root.textContent?.trim()).toBe(
      'A & B < C > D "따옴표" \'작은따옴표\' 1 < 2'
    );
  });
});

describe('renderDescription — 링크', () => {
  it('바깥 링크에 rel을 붙이고 target은 만들지 않는다', () => {
    const root = render(
      '[신청](https://example.com/apply?a=1&b=2) http://example.org'
    );
    const links = root.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe(
      'https://example.com/apply?a=1&b=2'
    );
    expect(links[1].getAttribute('href')).toBe('http://example.org');
    links.forEach((a) => {
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
      expect(a.hasAttribute('target')).toBe(false);
    });
  });

  it('대문자로 쓴 스킴과 주소 없는 스킴(//)도 바깥 링크로 다룬다', () => {
    const root = render('[a](HTTPS://Example.com/) [b](//example.com/x)');
    const links = root.querySelectorAll('a');
    expect(links[0].getAttribute('href')).toBe('HTTPS://Example.com/');
    expect(links[1].getAttribute('href')).toBe('//example.com/x');
    links.forEach((a) =>
      expect(a.getAttribute('rel')).toBe('noopener noreferrer')
    );
  });

  it('사이트 안 링크와 메일 링크에는 rel을 붙이지 않는다', () => {
    const root = render(
      '[목록](/events) [위로](#intro) 문의: help@example.com'
    );
    const links = root.querySelectorAll('a');
    expect(links).toHaveLength(3);
    expect(links[0].getAttribute('href')).toBe('/events');
    expect(links[1].getAttribute('href')).toBe('#intro');
    expect(links[2].getAttribute('href')).toBe('mailto:help@example.com');
    expect(links[2].textContent).toBe('help@example.com');
    links.forEach((a) => expect(a.hasAttribute('rel')).toBe(false));
  });
});

describe('renderDescription — 위험한 내용 제거', () => {
  it('<script> 태그와 그 안의 코드를 지운다', () => {
    const html = renderDescription(
      '소개\n\n<script>alert("xss")</script>\n\n끝'
    );
    const root = toDom(html);
    expect(root.querySelector('script')).toBeNull();
    expect(html).not.toContain('alert');
    expect(root.textContent).toContain('소개');
    expect(root.textContent).toContain('끝');
  });

  it('닫지 않은 <script>는 뒤에 이어 쓴 코드까지 지운다', () => {
    expect(renderDescription('<script>alert(1)')).toBe('');
    const html = renderDescription(
      '소개\n\n<SCRIPT src="x">\nalert(1)\n\n코드'
    );
    expect(html).not.toContain('alert');
    expect(toDom(html).textContent?.trim()).toBe('소개');
  });

  it('문장 안에서 태그 이름을 언급해도 뒤 내용이 사라지거나 표식이 남지 않는다', () => {
    const root = render('HTML의 <title> 태그와 <script> 태그를 배웁니다');
    expect(root.textContent?.trim()).toBe('HTML의  태그와  태그를 배웁니다');
  });

  it('onerror 같은 이벤트 속성을 지운다', () => {
    const root = render(
      '![그림](https://example.com/a.png"onerror="alert(1)) <img src="https://example.com/b.png" onerror="alert(2)">'
    );
    expect(root.querySelectorAll('img')).toHaveLength(1);
    root.querySelectorAll('*').forEach((el) => {
      const eventAttrs = Array.from(el.attributes).filter((attr) =>
        attr.name.startsWith('on')
      );
      expect(eventAttrs).toEqual([]);
    });
  });

  it('javascript: 링크는 주소를 지우고 글자만 남긴다', () => {
    const root = render(
      '[눌러 보세요](javascript:alert(1)) [둘](JaVaScRiPt:alert(2))'
    );
    const links = root.querySelectorAll('a');
    expect(links).toHaveLength(2);
    links.forEach((a) => expect(a.hasAttribute('href')).toBe(false));
    expect(links[0].textContent).toBe('눌러 보세요');
  });

  it('<iframe>·<style>·인라인 style을 지운다', () => {
    const html = renderDescription(
      [
        '<iframe src="https://example.com"></iframe>',
        '',
        '<style>body { display: none }</style>',
        '',
        '<p style="position:fixed;top:0">문단</p>',
      ].join('\n')
    );
    const root = toDom(html);
    expect(root.querySelector('iframe')).toBeNull();
    expect(root.querySelector('style')).toBeNull();
    expect(html).not.toContain('display: none');
    expect(root.querySelector('[style]')).toBeNull();
    expect(root.textContent).toContain('문단');
  });

  it('http(s)가 아닌 그림 주소를 지운다', () => {
    const root = render(
      '![a](data:image/svg+xml;base64,PHN2Zz4=) ![b](javascript:alert(1)) ![c](x)'
    );
    const imgs = root.querySelectorAll('img');
    expect(imgs).toHaveLength(3);
    imgs.forEach((img) => expect(img.hasAttribute('src')).toBe(false));
  });

  it('직접 쓴 HTML은 <br>만 남기고, 나머지는 태그를 지우고 글자만 남긴다', () => {
    const root = render(
      [
        '첫 줄<br>둘째 줄 <a href="https://example.com" target="_blank">링크 글자</a> <strong>굵은 글자</strong> <img src="https://example.com/a.png">',
        '',
        '<div class="box"><span>안쪽 글자</span></div>',
      ].join('\n')
    );
    expect(root.querySelectorAll('br')).toHaveLength(1);
    expect(root.querySelector('a, strong, img, div, span')).toBeNull();
    expect(root.textContent).toContain('링크 글자');
    expect(root.textContent).toContain('굵은 글자');
    expect(root.textContent).toContain('안쪽 글자');
  });

  it('<kbd>·<code> 사이에 쓴 글자도 이스케이프한다', () => {
    const root = render('가 <kbd>a < b <strong x"y</kbd> 나');
    expect(root.querySelector('strong')).toBeNull();
    expect(root.textContent?.trim()).toBe('가 a < b <strong x"y 나');
  });

  // 알려진 우회 수법 모음. 무엇이 나오든 허용 목록 밖의 것이 남으면 안 된다.
  const ATTACKS: string[] = [
    '<script>alert(1)</script>',
    '<SCRIPT SRC=https://example.com/x.js></SCRIPT>',
    '<scr<script>ipt>alert(1)</scr</script>ipt>',
    '<<script>script>alert(1)<</script>/script>',
    '<script\n>alert(1)</script\n>',
    '<script>alert(1)',
    '<img src=x onerror=alert(1)>',
    '<img src=x onerror=alert(1)//',
    '<img/src="x"/onerror=alert(1)>',
    '<img src="x" OnErRoR="alert(1)">',
    '<img src=x onerror\n=alert(1)>',
    '<img src="x`" `onerror=alert(1)>',
    "<img src='x' alt='\"onerror=\"alert(1)'>",
    '<img alt="><script>alert(1)</script>">',
    '![a](https://example.com/a.png"onerror="alert(1))',
    '![a"onerror="alert(1)](https://example.com/a.png)',
    '![a](https://example.com/a.png \'x" onerror="alert(1)\')',
    '[a](javascript:alert(1))',
    '[a](JAVASCRIPT:alert(1))',
    '[a](javascript&colon;alert(1))',
    '[a](java\tscript:alert(1))',
    '[a](&#106;avascript:alert(1))',
    '[a](&#x6A;avascript:alert(1))',
    '[a](&#0000106avascript:alert(1))',
    '[a](javascript&#58;alert(1))',
    '[a](javascript&#38;#58;alert(1))',
    '[a](javascript&amp;colon;alert(1))',
    '[a](vbscript:msgbox(1))',
    '[a](data:text/html,<script>alert(1)</script>)',
    '[a]( javascript:alert(1))',
    '<a href="  javascript:alert(1)">a</a>',
    '<a href="java&#10;script:alert(1)">a</a>',
    '<a href="java&Tab;script:alert(1)">a</a>',
    '<a href="&#1;javascript:alert(1)">a</a>',
    '<a href=javascript:alert(1)>a</a>',
    "<a href='javascript:alert(1)'>a</a>",
    '<a href="https://example.com" onclick="alert(1)" onmouseover=alert(2)>a</a>',
    '<a href="https://example.com" style="position:fixed;inset:0">a</a>',
    '<a href="https://example.com/"onclick="alert(1)">a</a>',
    '<a href="x:y" title="\\" onmouseover="alert(1)">a</a>',
    '[a](https://example.com "t\\" onmouseover=\\"alert(1)")',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    '<iframe><img src=x onerror=alert(1)></iframe>',
    '<style>@import "https://example.com/x.css";</style>',
    '<style><img src=x onerror=alert(1)></style>',
    '<link rel="stylesheet" href="https://example.com/x.css">',
    '<base href="https://example.com/">',
    '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
    '<object data="javascript:alert(1)"></object>',
    '<embed src="javascript:alert(1)">',
    '<form action="javascript:alert(1)"><input type="submit"><button formaction="javascript:alert(2)">b</button></form>',
    '<input type="text" value="x" onfocus="alert(1)" autofocus>',
    '<input type="checkbox" onclick="alert(1)">',
    '<textarea><img src=x onerror=alert(1)></textarea>',
    '<textarea></textarea/><img src=x onerror=alert(1)>',
    '<xmp><img src=x onerror=alert(1)></xmp>',
    '<noscript><p title="</noscript><img src=x onerror=alert(1)>"></noscript>',
    '<title><img src=x onerror=alert(1)></title>',
    '<template><img src=x onerror=alert(1)></template>',
    '<svg onload=alert(1)>',
    '<svg><script>alert(1)</script></svg>',
    '<svg><a xlink:href="javascript:alert(1)"><text>a</text></a></svg>',
    '<svg><textarea><img src=x onerror=alert(1)>',
    '<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
    '<math><annotation-xml encoding="text/html"><img src=x onerror=alert(1)></annotation-xml></math>',
    '<details open ontoggle=alert(1)><summary>a</summary></details>',
    '<video src=x onerror=alert(1)></video><audio src=x onerror=alert(1)></audio>',
    '<body onload=alert(1)>',
    '<marquee onstart=alert(1)>a</marquee>',
    '<p id="x" class="y" style="color:red" onclick="alert(1)" data-x="1">a</p>',
    '<h2 id="a" onclick="alert(1)" style="color:red">a</h2>',
    '<td align="left" onclick="alert(1)" background="javascript:alert(1)">a</td>',
    '<table background="javascript:alert(1)"><tr><td>a</td></tr></table>',
    '<code class="language-js\\" onclick=\\"alert(1)">a</code>',
    '<code class="x">a</code>',
    '<ol start="1\\" onclick=\\"alert(1)"><li>a</li></ol>',
    '<!--<img src="--><img src=x onerror=alert(1)//">',
    '<!-- 주석 --><img src=x onerror=alert(1)><!--',
    '<![CDATA[<img src=x onerror=alert(1)>]]>',
    '<?xml version="1.0"?><img src=x onerror=alert(1)>',
    '<img src="https://example.com/a.png" srcset="x 1x" onerror="alert(1)" width="1" height="1">',
    '<a href="https://example.com" target="_blank" rel="opener" ping="https://example.com/p">a</a>',
    '`<script>alert(1)</script>`',
    '```html\n<script>alert(1)</script>\n```',
    '```"onclick="alert(1)\ncode\n```',
    '| a |\n| - |\n| <script>alert(1)</script><img src=x onerror=alert(1)> |',
    '- [ ] <img src=x onerror=alert(1)>',
    '## <img src=x onerror=alert(1)>',
    '> <script>alert(1)</script>',
    '<p>문단<script>alert(1)</script></p>\n\n<p onclick=alert(1)>둘</p>',
    // 닫히지 않은 태그·짝 없는 닫는 태그로 본문 밖 화면을 망가뜨리려는 수법
    '<a href="https://example.com">닫지 않은 링크',
    '<strong>닫지 않은 굵게',
    '<table><tr><td>닫지 않은 표',
    '<h1>닫지 않은 제목',
    '<ul><li>닫지 않은 목록',
    '<pre><code>닫지 않은 코드',
    '<blockquote><del><em>닫지 않은 인용',
    '</p></li></ul></td></tr></table></blockquote>',
    '</div></div></section></main></body>',
    '<kbd><a href="https://example.com" x"y></kbd>',
    '<code><table x"y></code>',
    '<pre><strong x"y>글자</pre>',
    '<script><a href="https://example.com" x"y></script>',
    '글자 <kbd><a href="https://example.com" x"y 글자',
    '| a |\n| - |\n| <a href="https://example.com">닫지 않은 링크 |',
    '- <table><tr><td>목록 안의 닫지 않은 표',
  ];

  it.each(ATTACKS)('허용 목록 밖의 것을 남기지 않는다: %s', (attack) => {
    const html = renderDescription(`앞\n\n${attack}\n\n뒤`);
    expect(findViolations(toDom(html))).toEqual([]);
  });

  it.each(ATTACKS)(
    '브라우저가 다시 읽어도 허용 목록 밖의 것이 생기지 않는다: %s',
    (attack) => {
      const html = renderDescription(attack);
      expect(findViolations(toDom(toDom(html).innerHTML))).toEqual([]);
    }
  );

  it.each(ATTACKS)('본문 뒤의 화면을 삼키지 않는다: %s', (attack) => {
    expect(swallowsFollowingContent(renderDescription(attack))).toBe(false);
    expect(
      swallowsFollowingContent(renderDescription(`앞\n\n${attack}\n\n뒤`))
    ).toBe(false);
  });
});

describe('renderDescription — 빈 입력', () => {
  it('빈 문자열과 공백만 있는 문자열은 빈 문자열을 돌려준다', () => {
    expect(renderDescription('')).toBe('');
    expect(renderDescription('   \n\t ')).toBe('');
  });

  it('null·undefined·문자열이 아닌 값은 빈 문자열을 돌려준다', () => {
    expect(renderDescription(null)).toBe('');
    expect(renderDescription(undefined)).toBe('');
    expect(renderDescription(123 as unknown as string)).toBe('');
    expect(renderDescription({} as unknown as string)).toBe('');
  });
});

describe('renderDescription — 같은 입력에는 같은 결과', () => {
  it('메일 주소가 있어도 호출할 때마다 결과가 같다', () => {
    const markdown = '문의: help@example.com\n\n| a |\n| - |\n| b |';
    expect(renderDescription(markdown)).toBe(renderDescription(markdown));
  });
});
