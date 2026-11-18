/* 소개 · 검색 결과 · 오류 화면 · 공지 띠 · 공유 안내 시안 (2026-11-17). 각 열 가지.
   내용과 기능은 지금 서비스와 같다.
   - 소개(/about): 첫 구역(제목, 설명, "행사 둘러보기", "GitHub 저장소 보기"), 특징 세 가지, 행사 보러 가기 상자, 바로 가기 여섯 개.
   - 검색 결과(/search): 배너, 검색창, 조건에 맞는 행사 목록. 없으면 "찾으시는 행사정보가 없어요"와 추천 태그.
   - 오류(_error): "404 : 페이지를 찾을 수 없습니다!" 또는 "페이지를 불러오는 중에 문제가 발생했어요!" 한 줄.
   - 공지(NoticeModal): 헤더 맨 위 48px 띠. "개발자를 위한 행사 정보, 데브이벤트"와 달력 그림, 닫기(×, 90일 동안 다시 안 뜸).
   - 공유(ShareModal · SaveModal): 공유 버튼은 링크를 복사하고 화면 아래에 "링크가 복사되었습니다" 안내가 잠깐 뜬다. 담기도 같은 모양의 안내.
   주소 옵션: #about ?about=ab1…ab10 · #search ?sr=sr1…sr10 (&q=검색어 &none=1 결과 없음 &nobn=1 배너 빼고) · #error ?err=er1…er10 (&code=500)
              ?notice=nt1…nt10 (행사 일정 화면 위에 띠) · ?share=sh1…sh10 (&open=share 링크 복사 안내, &open=save 담기 안내가 뜬 채로) */
(function () {
  const Q = new URLSearchParams(location.search);
  const SK = () => window.STICKERS || { art: () => '', DEFS: '' };
  const stk = (name, c, x, y, r, s, side) => `<span class="lg-stk" style="${side || 'left'}:${x}px;top:${y}px;--r:${r}deg;--s:${s}">${SK().art(name, c)}</span>`;
  const BAND = (c) => stk('holo:logo', c, 300, 26, -7, 0.9, 'right') + stk('lg:js:hex:h', c, 196, 18, 9, 0.66, 'right') + stk('laptop', c, 232, 96, 8, 0.66, 'right') + stk('prompt', c, 96, 84, -6, 0.78, 'right') + stk('lg:linux:hex:h', c, 92, 10, 8, 0.66, 'right') + stk('lg:python:disc:w', c, 22, 62, -10, 0.58, 'right');
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const wcls = (d) => (d.getDay() === 0 ? 'sun' : d.getDay() === 6 ? 'sat' : '');
  const svg = (p, s) => `<svg width="${s || 22}" height="${s || 22}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

  /* ================= 소개 ================= */
  const GH = 'https://github.com/brave-people/Dev-Event';
  const A = {
    desc: '개발자 컨퍼런스와 밋업, 해커톤의 모든 일정,<br>놓치지 않고 가장 먼저 알려드립니다.',
    vh: '개발자를 위한 가치 있는 정보', vp: '전국의 개발자 컨퍼런스, 밋업, 해커톤 등 기술 이벤트를 큐레이션하여 개발자들이 더 성장할 수 있도록 돕습니다.',
    fe: [['<path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z"/>', '빠르고 정확하게', '새로운 행사를 빠르게 수집하고 검증하여 정확한 정보를 제공합니다.'],
      ['<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.500s-1 6-3.500 8.500c-2.500-2.500-3.500-5.500-3.500-8.500s1-6 3.500-8.500z"/>', '다양한 이벤트', '컨퍼런스, 밋업, 해커톤 등 다양한 기술 이벤트를 다룹니다.'],
      ['<path d="M12 20.500S3.500 15.700 3.500 9.700C3.500 6 8 4.200 12 7.900c4-3.700 8.500-1.900 8.500 1.800 0 6-8.500 10.800-8.500 10.800z"/>', '개발자 커뮤니티', '개발자들이 정보를 공유하고 함께 성장할 수 있는 연결을 지향합니다.']],
    cp: '다음 성장의 기회를 찾고 있나요?', ch: '오늘 열리는 개발자 행사를 만나보세요.',
    sh: '데브이벤트를 더 가까이', sp: '앱과 소셜 미디어, 이메일에서도 새로운 개발자 행사 소식을 만나보세요.',
    // 그림은 목업용 선 그림. 실제 구현에서는 지금 쓰는 각 서비스의 아이콘을 쓴다
    sv: [['Android 앱', 'Google Play에서 데브이벤트 앱으로 새로운 개발자 행사를 빠르게 확인하세요.', 'https://play.google.com/store/apps/details?id=com.bravepeople.devevent.android.app', '<rect x="6.5" y="2.500" width="11" height="19" rx="2.500"/><path d="M10.500 18.500h3"/>', 'android'],
      ['iOS 앱', 'App Store에서 데브이벤트를 설치하고 관심 있는 행사 소식을 놓치지 마세요.', 'https://apps.apple.com/kr/app/id6502765233', '<rect x="6.500" y="2.500" width="11" height="19" rx="3"/><path d="M10 5h4"/>', 'ios'],
      ['Instagram', '행사 소식과 큐레이션 콘텐츠를 인스타그램에서 가볍게 만나보세요.', 'https://www.instagram.com/dev.event.official/', '<rect x="3.500" y="3.500" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6" fill="currentColor"/>', 'instagram'],
      ['Threads', '데브이벤트의 짧은 소식과 이야기를 Threads에서 편하게 이어서 만나보세요.', 'https://www.threads.com/@dev.event.official?hl=ko', '<circle cx="12" cy="12" r="3.500"/><path d="M15.500 8.500v5a2.500 2.500 0 005 0V12a8.500 8.500 0 10-3.400 6.800"/>', 'threads'],
      ['Email 구독', '새로운 개발자 행사 정보를 정리된 이메일로 받아보세요.', 'https://github.com/brave-people/Dev-Event-Subscribe', '<rect x="3.500" y="5.500" width="17" height="13" rx="3"/><path d="M4.500 8l7.500 5 7.500-5"/>', 'email'],
      ['웨일 확장앱', '웨일 브라우저에 데브이벤트를 추가하고 새로운 행사 소식을 더 빠르게 확인하세요.', 'https://store.whale.naver.com/detail/dfhagfnmecmkhdoeggeokfmmkbpiahek', '<path d="M4 7.500h16v9a3 3 0 01-3 3H7a3 3 0 01-3-3z"/><path d="M4 7.500l2-3h12l2 3M9 12h6"/>', 'whale']],
  };
  const ext = 'target="_blank" rel="noopener"';
  const acts = (cls) => `<div class="ab-acts ${cls || ''}"><a class="ab-go press" href="#main">행사 둘러보기</a><a class="ab-gh" href="${GH}" ${ext}>GitHub 저장소 보기 <span aria-hidden="true">→</span></a></div>`;
  const value = () => `<h2 class="ab-h2">${A.vh}</h2><p class="ab-lead">${A.vp}</p>`;
  const feats = (num) => `<div class="ab-fe">${A.fe.map(([p, t, d], n) => `<article><span class="ab-fe__i">${num ? '0' + (n + 1) : svg(p, 24)}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>`;
  const cta = () => `<div class="ab-cta"><div><p>${A.cp}</p><h2>${A.ch}</h2></div><a class="press" href="#main">전체 행사 보기 <span aria-hidden="true">→</span></a></div>`;
  const svHead = () => `<h2 class="ab-h2">${A.sh}</h2><p class="ab-lead">${A.sp}</p>`;
  const svcs = (kind) => (kind === 'rows'
    ? `<ul class="ab-sv ab-sv--rows">${A.sv.map(([n, d, u, p]) => `<li><a href="${u}" ${ext} aria-label="${n} 바로가기"><i>${svg(p, 22)}</i><b>${n}</b><span>${d}</span><em aria-hidden="true">→</em></a></li>`).join('')}</ul>`
    : kind === 'icons'
      ? `<div class="ab-sv ab-sv--icons">${A.sv.map(([n, d, u, p]) => `<a href="${u}" ${ext} title="${d}" aria-label="${n} 바로가기"><i>${svg(p, 22)}</i><b>${n}</b></a>`).join('')}</div>`
      : `<div class="ab-sv ab-sv--cards">${A.sv.map(([n, d, u, p]) => `<a href="${u}" ${ext} aria-label="${n} 바로가기"><i>${svg(p, 22)}</i><b>${n}</b><span>${d}</span><em aria-hidden="true">→</em></a>`).join('')}</div>`);
  const rest = (o) => `<section class="wrap ab-sec">${value()}${feats(o && o.num)}</section><section class="wrap ab-sec is-tight">${cta()}</section><section class="wrap ab-sec">${svHead()}${svcs((o && o.sv) || 'cards')}</section>`;
  const apage = (v, inner) => `<main class="ab ab--${v}">${inner}</main>`;

  const AB = {
    // 1. 홀로그램 머리띠: 관심 행사·로그인과 같은 어두운 스티커 띠가 첫 구역
    ab1: (c) => apage('ab1', `<section class="wrap"><div class="sv6__band ab1__hero">${SK().DEFS}<div class="sv6__stk" aria-hidden="true">${BAND(c)}</div><div class="ab1__in"><h1>DEV EVENT</h1><p>${A.desc}</p>${acts('is-dark')}</div></div></section>${rest({ sv: 'rows' })}`),

    // 2. 스티커 벽: 밝은 종이 바탕에 큰 제목, 둘레에 스티커
    ab2: (c) => apage('ab2', `<section class="wrap"><div class="ab2__hero">${SK().DEFS}<div class="ab2__stk" aria-hidden="true">${stk('lg:js:hex:h', c, 60, 40, -10, 1)}${stk('laptop', c, 150, 250, 8, 1.1)}${stk('holo:code', c, 30, 300, -6, 0.9)}${stk('lg:python:disc:w', c, 250, 60, 9, 0.8)}${stk('prompt', c, 70, 50, 7, 1.2, 'right')}${stk('lg:linux:hex:h', c, 190, 240, -8, 1.1, 'right')}${stk('term', c, 40, 290, 6, 0.9, 'right')}${stk('lg:git:disc:h', c, 250, 90, -9, 0.8, 'right')}</div>
      <div class="ab2__in"><h1 aria-label="DEV EVENT"><span>${SK().art('holo:logo', c)}</span></h1><p>${A.desc}</p>${acts()}</div></div></section>${rest()}`),

    // 3. 큰 글자: 그림 없이 글자 크기만으로
    ab3: (c) => apage('ab3', `<section class="wrap ab3__hero"><h1>DEV<br>EVENT</h1><div><p>${A.desc}</p>${acts()}</div></section>
      <section class="wrap ab-sec">${value()}${feats(true)}</section><section class="wrap ab-sec is-tight"><a class="ab3__cta" href="#main"><span>${A.cp}</span><b>${A.ch} <i aria-hidden="true">→</i></b></a></section><section class="wrap ab-sec">${svHead()}${svcs('rows')}</section>`),

    // 4. 터미널: 명령을 친 결과처럼
    ab4: (c) => apage('ab4', `<section class="wrap"><div class="sv10__w ab4__w"><div class="my-bar" aria-hidden="true"><i></i><i></i><i></i><span>about — dev-event</span></div><div class="ab4__b">
      <p><i>$</i> dev-event --about</p><h1>DEV EVENT</h1><p class="o">${A.desc}</p>
      <div class="b">${acts('is-term')}</div>
      <p><i>$</i> dev-event --why</p><h2>${A.vh}</h2><p class="o">${A.vp}</p><dl>${A.fe.map(([, t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>
      <p><i>$</i> dev-event --channels <span class="c"># ${A.sh}</span></p><dl class="is-link">${A.sv.map(([n, d, u]) => `<div><dt><a href="${u}" ${ext}>${n}</a></dt><dd>${d}</dd></div>`).join('')}</dl>
      <p><i>$</i> <a class="ab4__go" href="#main">dev-event list</a> <span class="c"># ${A.ch}</span><b class="sv10__cur"></b></p></div></div></section>`),

    // 5. README: 저장소의 README 문서처럼
    ab5: (c) => apage('ab5', `<section class="wrap"><div class="ab5__doc"><div class="ab5__tab">${svg('<path d="M6 3.500h8l4 4v13H6z"/><path d="M14 3.500v4h4"/>', 16)}README.md</div><article>
      <h1>DEV EVENT</h1><blockquote>${A.desc}</blockquote><p class="ab5__acts"><a class="ab5__badge is-blue" href="#main"><i>events</i><b>행사 둘러보기</b></a><a class="ab5__badge" href="${GH}" ${ext}><i>github</i><b>저장소 보기</b></a></p>
      <h2>${A.vh}</h2><p>${A.vp}</p><ul>${A.fe.map(([, t, d]) => `<li><b>${t}</b> — ${d}</li>`).join('')}</ul>
      <h2>${A.sh}</h2><p>${A.sp}</p><table><thead><tr><th>채널</th><th>설명</th></tr></thead><tbody>${A.sv.map(([n, d, u]) => `<tr><td><a href="${u}" ${ext}>${n}</a></td><td>${d}</td></tr>`).join('')}</tbody></table>
      <h2>${A.cp}</h2><p><a href="#main">${A.ch} →</a></p></article></div></section>`),

    // 6. 실제 화면 미리보기: 오른쪽에 지금 올라와 있는 행사를 그대로 보여 준다
    ab6: (c) => { const up = c.UP.slice().sort((x, y) => x.keyDate - y.keyDate).filter((e) => e.img).slice(0, 3);
      return apage('ab6', `<section class="wrap ab6__hero"><div><h1>DEV EVENT</h1><p>${A.desc}</p>${acts()}</div>
        <div class="ab6__win" aria-hidden="true"><div class="ab6__bar"><i></i><i></i><i></i><span>dev-event.vercel.app/events</span></div><div class="ab6__body">${up.map((e) => `<div class="ab6__r"><b>${c.fd(e.keyDate)}<small>${DOW[e.keyDate.getDay()]}</small></b><span class="ab6__t">${c.thumb(e)}</span><span><i class="my-dd ${e.recruit ? 'is-dead' : 'is-open'}">${e.label}</i><strong class="clamp2">${c.esc(e.title)}</strong></span></div>`).join('')}</div></div></section>${rest()}`); },

    // 7. 포스터 벽: 첫 구역 뒤에 실제 행사 포스터
    ab7: (c) => { const im = c.UP.filter((e) => e.img), t = Array.from({ length: 36 }, (_, i) => im[i % im.length]);
      return apage('ab7', `<section class="ab7__hero"><div class="ab7__wall" aria-hidden="true">${t.map((e) => `<i style="background-image:url('${c.esc(e.img)}')"></i>`).join('')}</div><div class="ab7__in"><h1>DEV EVENT</h1><p>${A.desc}</p>${acts('is-dark')}</div></section>${rest()}`); },

    // 8. 한 화면: 스크롤 없이 한 화면에
    ab8: (c) => apage('ab8', `<section class="wrap ab8__g"><div class="ab8__l"><h1>DEV EVENT</h1><p>${A.desc}</p>${acts()}</div>
      <div class="ab8__r"><h2>${A.vh}</h2><p>${A.vp}</p><ul>${A.fe.map(([p, t, d]) => `<li><i>${svg(p, 20)}</i><div><b>${t}</b><span>${d}</span></div></li>`).join('')}</ul></div>
      <div class="ab8__b"><b>${A.sh}</b>${svcs('icons')}</div></section>`),

    // 9. 타임라인 형식: 행사 일정 화면과 같은 틀(왼쪽 줄, 오른쪽 내용)
    ab9: (c) => { const sec = (k, s, body) => `<section class="day"><div class="day__rail"><div class="day__stick"><b>${k}</b><span>${s}</span></div></div><div class="day__list ab9__c">${body}</div></section>`;
      return apage('ab9', `<div class="wrap">${sec('소개', 'DEV EVENT', `<h1>DEV EVENT</h1><p class="ab-lead">${A.desc}</p>${acts()}`)}${sec('특징', '세 가지', `${value()}${feats()}`)}${sec('시작', '행사 보기', cta())}${sec('채널', '여섯 곳', `${svHead()}${svcs('rows')}`)}</div>`); },

    // 10. 지금 것 다듬기: 지금 화면의 구성(어두운 별 배경 첫 구역, 색 있는 특징 카드, 바로 가기 카드)을 그대로
    ab10: (c) => apage('ab10', `<section class="ab10__hero"><div class="ab10__stars" aria-hidden="true"></div><div class="ab10__in"><h1><span>DEV</span> <span>EVENT</span></h1><p>${A.desc}</p>${acts('is-dark')}</div><a class="ab10__more" href="#ab10-about">더 알아보기 <span aria-hidden="true">↓</span></a></section>
      <div id="ab10-about">${rest()}</div>`),
  };
  const AB_NAMES = { ab1: '홀로그램 머리띠', ab2: '스티커 벽', ab3: '큰 글자', ab4: '터미널', ab5: 'README', ab6: '실제 화면 미리보기', ab7: '포스터 벽', ab8: '한 화면', ab9: '타임라인 형식', ab10: '지금 것 다듬기' };

  /* ================= 검색 결과 ================= */
  const SUG = ['AI', '클라우드', '보안', '블록체인', '기술일반', '온라인', '무료'];
  const smodel = (c) => {
    const none = Q.get('none') === '1', q = none ? 'zzzzqq' : (c.S.q || 'AI').trim(), k = q.toLowerCase();
    const list = c.UP.filter((e) => (e.title + ' ' + e.organizer + ' ' + e.tags.join(' ')).toLowerCase().includes(k) && (c.S.topic === '전체' || e.topics.includes(c.S.topic)) && (c.S.mode === '전체' || e.mode.includes(c.S.mode)) && (c.S.cost === '전체' || e.cost === c.S.cost))
      .sort((a, b) => a.keyDate - b.keyDate || a.en - b.en);
    return { q, list, n: list.length };
  };
  const hl = (c, t, q) => { const s = c.esc(t), i = s.toLowerCase().indexOf(c.esc(q).toLowerCase()); return i < 0 ? s : `${s.slice(0, i)}<mark>${s.slice(i, i + c.esc(q).length)}</mark>${s.slice(i + c.esc(q).length)}`; };
  const sform = (c, m, cls) => `<form class="sr-q ${cls || ''}" data-sr-form role="search"><label>${c.ic('search', 19)}<input name="q" type="search" value="${c.esc(m.q)}" placeholder="행사명, 주최로 검색" aria-label="행사 검색" autocomplete="off"></label></form>`;
  const shead = (c, m) => `<div class="sr-head"><h1><em>‘${c.esc(m.q)}’</em> 검색 결과<i>${m.n}</i></h1>${sform(c, m)}</div>`;
  const sempty = (c, m) => `<div class="sr-empty"><span class="my-empty__ic">${c.ic('search', 32)}</span><b>찾으시는 행사 정보가 없어요</b><p>추천 태그로 검색해 보세요</p><div class="sr-tags">${SUG.map((t) => `<button class="chip press" data-sq="${t}">${t}</button>`).join('')}</div></div>`;
  const badge = (e) => `<i class="my-dd ${e.ended ? 'is-done' : e.recruit ? 'is-dead' : 'is-open'}">${e.label}</i>`;
  const when = (c, e) => (e.recruit ? `${c.fdw(e.en)}${e.slot.time ? ' ' + e.slot.time : ''} 접수 마감` : e.range);
  const meta = (e) => [...e.mode, e.cost].filter(Boolean).join(' · ');
  const favb = (c, e, s) => `<button class="my-fav${c.S.fav.has(e.id) ? ' is-on' : ''}" data-fav="${e.id}" aria-label="관심 행사에 담기">${c.ic('bookmark', s || 20)}</button>`;
  const srow = (c, e, q) => `<article class="my-row sr-row"><a href="${e.href}"><span class="my-row__img">${c.thumb(e)}</span><span class="my-row__b">${badge(e)}<b class="clamp2">${q ? hl(c, e.title, q) : c.esc(e.title)}</b><small class="clamp1">${c.esc(e.organizer)} · ${when(c, e)}</small></span></a>${favb(c, e)}</article>`;
  const byDay = (list) => { const m = new Map(); list.forEach((e) => { if (!m.has(e.k)) m.set(e.k, { key: e.k, date: new Date(e.keyDate.getFullYear(), e.keyDate.getMonth(), e.keyDate.getDate()), items: [] }); m.get(e.k).items.push(e); }); return [...m.values()]; };
  const spage = (v, inner) => `<main class="wrap my sr sr--${v}">${inner}</main>`;
  const SF = [['topic', '주제', ['전체', 'AI', '클라우드', '블록체인', '보안', '기술일반']], ['mode', '방식', ['전체', '온라인', '오프라인']], ['cost', '비용', ['전체', '무료', '유료']]];

  const SR = {
    // 1. 날짜 타임라인: 행사 일정 화면과 같은 틀에 결과만
    sr1: (c, m) => spage('sr1', shead(c, m) + (m.n ? byDay(m.list).map((g) => `<section class="day"><div class="day__rail"><div class="day__stick"><b>${c.fd(g.date)}</b><span class="${wcls(g.date)}">${DOW[g.date.getDay()]}요일</span><small>${g.items.length}건</small></div></div><div class="day__list">${g.items.map(c.card).join('')}</div></section>`).join('') : sempty(c, m))),

    // 2. 줄 목록: 썸네일 없이 한 줄에 한 행사, 검색어에 색
    sr2: (c, m) => spage('sr2', shead(c, m) + (m.n ? `<ul class="sv2__l">${m.list.map((e) => `<li><a href="${e.href}"><span class="sv2__d">${badge(e)}</span><span class="sv2__m"><b class="clamp1">${hl(c, e.title, m.q)}</b><small class="clamp1">${c.esc(e.organizer)} · ${when(c, e)}</small></span><span class="sv2__t">${meta(e)}</span></a>${favb(c, e)}</li>`).join('')}</ul>` : sempty(c, m))),

    // 3. 포스터 격자
    sr3: (c, m) => spage('sr3', shead(c, m) + (m.n ? `<div class="sv3__g">${m.list.map((e) => `<article><a href="${e.href}"><span class="sv3__img">${c.thumb(e)}</span>${badge(e)}<b class="clamp2">${hl(c, e.title, m.q)}</b><small class="clamp1">${when(c, e)}</small></a>${favb(c, e)}</article>`).join('')}</div>` : sempty(c, m))),

    // 4. 상태 묶음: 접수 중 / 행사 예정 / 진행 중
    sr4: (c, m) => spage('sr4', shead(c, m) + (m.n ? ['접수 중', '예정', '진행 중'].map((s) => { const it = m.list.filter((e) => e.state === s); return it.length ? `<section class="sv5__s"><h2>${s === '예정' ? '행사 예정' : s}<i>${it.length}</i></h2><div>${it.map((e) => srow(c, e, m.q)).join('')}</div></section>` : ''; }).join('') : sempty(c, m))),

    // 5. 큰 검색창: 검색창이 주인공
    sr5: (c, m) => spage('sr5', `<div class="sr5__top">${sform(c, m, 'is-big')}<div class="sr-tags">${SUG.map((t) => `<button class="chip press${t === m.q ? ' is-on' : ''}" data-sq="${t}">${t}</button>`).join('')}</div></div>
      ${m.n ? `<p class="sr5__n"><b>‘${c.esc(m.q)}’</b> 검색 결과 ${m.n}건</p><div class="sv6__l">${m.list.map((e) => srow(c, e, m.q)).join('')}</div>` : sempty(c, m)}`),

    // 6. 홀로그램 머리띠: 관심 행사와 같은 띠 안에 검색창
    sr6: (c, m) => spage('sr6', `<div class="sv6__band">${SK().DEFS}<div class="sv6__stk" aria-hidden="true">${BAND(c)}</div><div class="sv6__in sr6__in"><h1>검색</h1>${sform(c, m, 'is-band')}</div></div>
      ${m.n ? `<p class="sr5__n"><b>‘${c.esc(m.q)}’</b> 검색 결과 ${m.n}건</p><div class="sv6__l">${m.list.map((e) => srow(c, e, m.q)).join('')}</div>` : sempty(c, m)}`),

    // 7. 두 칸: 왼쪽에 조건, 오른쪽에 결과
    sr7: (c, m) => spage('sr7', shead(c, m) + `<div class="sr7__g"><aside>${SF.map(([k, l, vs]) => `<div><h2>${l}</h2>${vs.map((v) => `<button class="${c.S[k] === v ? 'is-on' : ''}" data-sf="${k}:${v}"><i></i>${v}</button>`).join('')}</div>`).join('')}</aside><div>${m.n ? m.list.map((e) => srow(c, e, m.q)).join('') : sempty(c, m)}</div></div>`),

    // 8. 달력과 결과: 결과가 있는 날이 달력에 찍힌다
    sr8: (c, m) => {
      if (!m.n) return spage('sr8', shead(c, m) + sempty(c, m));
      const base = m.list[0].keyDate, y = base.getFullYear(), mo = base.getMonth(), first = new Date(y, mo, 1).getDay(), len = new Date(y, mo + 1, 0).getDate();
      const cnt = {}; m.list.forEach((e) => { cnt[e.k] = (cnt[e.k] || 0) + 1; });
      const cells = Array.from({ length: first }, () => '<i></i>').concat(Array.from({ length: len }, (_, i) => { const k = `${y}-${c.pad(mo + 1)}-${c.pad(i + 1)}`, n = cnt[k] || 0; return n ? `<button class="has${k === c.TODAY ? ' is-today' : ''}" data-svday="${k}" aria-label="${mo + 1}월 ${i + 1}일, 결과 ${n}건">${i + 1}<em>${n}</em></button>` : `<span class="${k === c.TODAY ? 'is-today' : ''}">${i + 1}</span>`; }));
      return spage('sr8', shead(c, m) + `<div class="sv4__in"><aside class="sv4__cal"><b>${y}년 ${mo + 1}월</b><div class="sv4__w">${DOW.map((d, i) => `<span class="${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}">${d}</span>`).join('')}</div><div class="sv4__g">${cells.join('')}</div></aside>
        <div class="sv4__l">${byDay(m.list).map((g) => `<section id="svd-${g.key}"><h2><span class="${wcls(g.date)}">${c.fdw(g.date)}</span><i>${g.items.length}건</i></h2>${g.items.map((e) => srow(c, e, m.q)).join('')}</section>`).join('')}</div></div>`);
    },

    // 9. 터미널: 검색 명령의 결과처럼
    sr9: (c, m) => spage('sr9', `<div class="sv10__w"><div class="my-bar" aria-hidden="true"><i></i><i></i><i></i><span>search — dev-event</span></div><div class="sv10__b sr9__b">
      <form class="sr9__f" data-sr-form><label><i>$</i> dev-event search <input name="q" type="search" value="${c.esc(m.q)}" aria-label="행사 검색" autocomplete="off" size="${Math.max(6, m.q.length + 2)}"></label></form>
      ${m.n ? `<ol>${m.list.map((e) => `<li><a href="${e.href}"><span class="sv10__d ${e.recruit ? 'is-r' : ''}">${e.label.replace('마감 ', '')}</span><span class="sv10__w">${c.fdw(e.recruit ? e.en : e.s)}</span><span class="sv10__k">${e.slot.chip}</span><b class="clamp1">${hl(c, e.title, m.q)}</b></a></li>`).join('')}</ol><p class="sv10__c"># ${m.n}건<b class="sv10__cur"></b></p>`
        : `<p class="sv10__e">찾으시는 행사 정보가 없어요.</p><p class="sv10__c"># 추천 태그로 검색해 보세요</p><p class="sr9__s">${SUG.map((t) => `<button data-sq="${t}">${t}</button>`).join('')}</p>`}</div></div>`),

    // 10. 빠른 검색 창: 화면을 바꾸지 않고 창 하나에서 찾고 바로 이동
    sr10: (c, m) => spage('sr10', `<div class="sr10__bg" aria-hidden="true">${c.UP.slice(0, 3).map((e) => `<div class="my-row"><span class="my-row__img">${c.thumb(e)}</span></div>`).join('')}</div>
      <div class="sr10__p" role="dialog" aria-label="행사 검색">${sform(c, m, 'is-pal')}
      ${m.n ? `<ul>${m.list.slice(0, 7).map((e, i) => `<li class="${i ? '' : 'is-cur'}"><a href="${e.href}">${badge(e)}<b class="clamp1">${hl(c, e.title, m.q)}</b><small>${c.fd(e.keyDate)}</small></a></li>`).join('')}</ul>` : `<div class="sr10__e"><b>찾으시는 행사 정보가 없어요</b><p>추천 태그로 검색해 보세요</p><div class="sr-tags">${SUG.map((t) => `<button class="chip press" data-sq="${t}">${t}</button>`).join('')}</div></div>`}
      <p class="sr10__k"><kbd>↑</kbd><kbd>↓</kbd> 이동 <kbd>Enter</kbd> 열기 <kbd>Esc</kbd> 닫기${m.n > 7 ? `<span>결과 ${m.n}건 가운데 7건</span>` : ''}</p></div>`),
  };
  const SR_NAMES = { sr1: '날짜 타임라인', sr2: '줄 목록', sr3: '포스터 격자', sr4: '상태 묶음', sr5: '큰 검색창', sr6: '홀로그램 머리띠', sr7: '두 칸', sr8: '달력과 결과', sr9: '터미널', sr10: '빠른 검색 창' };

  /* ================= 오류 화면 ================= */
  const emodel = () => { const code = Q.get('code') === '500' ? 500 : 404; return { code, msg: code === 404 ? '페이지를 찾을 수 없습니다' : '페이지를 불러오는 중에 문제가 발생했어요', d: String(code).split('') }; };
  // "행사 일정으로 가기" 버튼은 지금 화면에 없는 것(지금은 글 한 줄뿐). 500일 때는 "다시 시도"도 함께
  const ego = (m, cls) => `<div class="er-acts ${cls || ''}"><a class="my-btn is-ink press" href="#main">행사 일정으로 가기</a>${m.code === 500 ? '<button class="my-btn press" data-toast="화면을 다시 불러와요">다시 시도</button>' : ''}</div>`;
  const epage = (v, inner) => `<main class="wrap er er--${v}">${inner}</main>`;
  const ER = {
    // 1. 기본: 큰 숫자, 한 줄, 버튼
    er1: (c, m) => epage('er1', `<b class="er1__n">${m.code}</b><h1>${m.msg}</h1>${ego(m)}`),
    // 2. 홀로그램 스티커 숫자
    er2: (c, m) => epage('er2', `${SK().DEFS}<div class="er2__n" aria-hidden="true">${m.d.map((x, i) => `<span style="--r:${[-8, 5, -4][i]}deg">${SK().art('hx:' + x + ':' + (i === 1 ? 'k' : 'h'), c)}</span>`).join('')}</div><h1><span class="er-sr">${m.code}</span>${m.msg}</h1>${ego(m)}`),
    // 3. 터미널
    er3: (c, m) => epage('er3', `<div class="sv10__w"><div class="my-bar" aria-hidden="true"><i></i><i></i><i></i><span>dev-event</span></div><div class="sv10__b er3__b"><p><i>$</i> dev-event open ${m.code === 404 ? '/this/page' : '/events'}</p><h1>${m.code === 404 ? 'error: no such page' : 'error: failed to load'} <span>(${m.code})</span></h1><p class="o">${m.msg}</p><p><i>$</i> <a href="#main">dev-event list</a><b class="sv10__cur"></b></p></div></div>`),
    // 4. 빈 달력 칸: 달력에서 한 칸만 비어 있다
    er4: (c, m) => epage('er4', `<div class="er4__cal" aria-hidden="true">${Array.from({ length: 21 }, (_, i) => (i === 10 ? `<b>${m.code}</b>` : `<i>${i + 3}</i>`)).join('')}</div><h1><span class="er-sr">${m.code}</span>${m.msg}</h1>${ego(m)}`),
    // 5. 떨어진 스티커: 붙어 있던 자리만 남고 스티커는 아래로
    er5: (c, m) => epage('er5', `${SK().DEFS}<div class="er5__s" aria-hidden="true"><i></i><span>${SK().art('holo:logo', c)}</span></div><h1><em>${m.code}</em>${m.msg}</h1>${ego(m)}`),
    // 6. 콘솔 오류: 개발자 도구의 빨간 줄
    er6: (c, m) => epage('er6', `<div class="er6__c"><p class="er6__e"><i>✕</i><span><b>GET</b> ${m.code === 404 ? '/this/page' : '/events'} <b>${m.code}</b> (${m.code === 404 ? 'Not Found' : 'Internal Server Error'})</span></p><p class="er6__m"><i>›</i><span>${m.msg}</span></p><p class="er6__l"><i>›</i><span>at <a href="#main">행사 일정으로 가기</a>${m.code === 500 ? ' · <button data-toast="화면을 다시 불러와요">다시 시도</button>' : ''}</span></p></div>`),
    // 7. 끊긴 타임라인: 날짜 줄이 여기서 끊긴다
    er7: (c, m) => epage('er7', `<section class="day"><div class="day__rail"><div class="day__stick"><b>${m.code}</b><span>${m.code === 404 ? '없는 날짜' : '오류'}</span></div></div><div class="day__list er7__c"><h1>${m.msg}</h1>${ego(m)}</div></section><i class="er7__end" aria-hidden="true"></i>`),
    // 8. 대신 볼 행사: 안내 아래에 곧 다가오는 행사 세 건
    er8: (c, m) => { const up = c.UP.slice().sort((x, y) => x.keyDate - y.keyDate).slice(0, 3); return epage('er8', `<div class="er8__t"><b>${m.code}</b><h1>${m.msg}</h1>${ego(m)}</div><h2>대신 이런 행사는 어떠세요</h2><div class="sv6__l">${up.map((e) => srow(c, e)).join('')}</div>`); },
    // 9. 큰 숫자: 화면 폭을 채우는 숫자
    er9: (c, m) => epage('er9', `<b class="er9__n" aria-hidden="true">${m.code}</b><div class="er9__b"><h1><span class="er-sr">${m.code}</span>${m.msg}</h1>${ego(m)}</div>`),
    // 10. 한 줄: 지금처럼 글 한 줄, 링크만 더함
    er10: (c, m) => epage('er10', `<p><b>${m.code}</b><span>${m.msg}</span><a href="#main">행사 일정으로 가기 →</a></p>`),
  };
  const ER_NAMES = { er1: '기본', er2: '홀로그램 스티커 숫자', er3: '터미널', er4: '빈 달력 칸', er5: '떨어진 스티커', er6: '콘솔 오류', er7: '끊긴 타임라인', er8: '대신 볼 행사', er9: '큰 숫자', er10: '한 줄' };

  /* ================= 공지 띠 ================= */
  const NT_TEXT = '개발자를 위한 행사 정보, 데브이벤트';
  const ntx = (c) => `<button class="nt__x" data-ex="ntclose" aria-label="공지 닫기">${c.ic('x', 16)}</button>`;
  const ntb = (c) => `<span class="nt__t">${c.ic('calendar', 17)}<b>${NT_TEXT}</b></span>`;
  const NT = {
    nt1: (c) => `<div class="nt nt--nt1" role="note"><div class="nt__in">${ntb(c)}${ntx(c)}</div></div>`,                               // 1. 기본 띠: 옅은 회색 한 줄
    nt2: (c) => `<div class="nt nt--nt2" role="note"><div class="nt__in">${ntb(c)}${ntx(c)}</div></div>`,                               // 2. 홀로그램 띠
    nt3: (c) => `<div class="nt nt--nt3" role="note"><div class="nt__in">${ntb(c)}${ntx(c)}</div></div>`,                               // 3. 검정 띠에 홀로그램 글자
    nt4: (c) => `<div class="nt nt--nt4" role="note"><div class="nt__mq" aria-hidden="true">${Array.from({ length: 8 }, () => `<span>${NT_TEXT}<i>✦</i></span>`).join('')}</div><span class="er-sr">${NT_TEXT}</span>${ntx(c)}</div>`, // 4. 흐르는 글자
    nt5: (c) => `<div class="nt nt--nt5" role="note">${ntb(c)}${ntx(c)}</div>`,                                                        // 5. 아래 가운데 알약
    nt6: (c) => `<div class="nt nt--nt6" role="note"><div class="nt__in"><span class="nt__t"><i>&gt;</i><b>${NT_TEXT}</b><em class="sv10__cur"></em></span>${ntx(c)}</div></div>`, // 6. 터미널 한 줄
    nt7: (c) => `<div class="nt nt--nt7" role="note"><span class="nt__ic">${c.ic('calendar', 20)}</span><b>${NT_TEXT}</b>${ntx(c)}</div>`, // 7. 오른쪽 아래 카드
    nt8: (c) => `<div class="nt nt--nt8" role="note">${SK().DEFS}<span class="nt8__s">${ntb(c)}</span>${ntx(c)}</div>`,                  // 8. 스티커 한 장
    nt9: (c) => `<div class="nt nt--nt9" role="note">${ntb(c)}${ntx(c)}</div>`,                                                        // 9. 화면 아래 띠
    nt10: (c) => `<div class="nt nt--nt10" role="note"><b>${NT_TEXT}</b>${ntx(c)}</div>`,                                              // 10. 로고 아래 말풍선 (헤더 바로 아래 줄에 놓인다)
  };
  const NT_NAMES = { nt1: '기본 띠', nt2: '홀로그램 띠', nt3: '검정 띠에 홀로그램 글자', nt4: '흐르는 글자', nt5: '아래 가운데 알약', nt6: '터미널 한 줄', nt7: '오른쪽 아래 카드', nt8: '스티커 한 장', nt9: '화면 아래 띠', nt10: '로고 아래 말풍선' };

  /* ================= 공유 · 담기 안내 ================= */
  const SH_MSG = { share: '링크가 복사되었어요', save: '관심 행사에 담았어요', unsave: '관심 행사에서 뺐어요' };
  const chk = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>';
  const URLT = 'dev-event.vercel.app/event/detail/3489';
  // anchor: 'btn' 이면 누른 버튼 옆에 붙는다(app.js 가 자리를 잡는다)
  const SH = {
    sh1: (c, k) => ({ html: `<div class="xt xt--sh1" role="status">${chk}<span>${SH_MSG[k]}</span></div>` }),                                              // 1. 아래 가운데 알약
    sh2: (c, k) => ({ html: `<div class="xt xt--sh2" role="status"><span>${chk}${SH_MSG[k]}</span></div>` }),                                              // 2. 홀로그램 테 알약
    sh3: (c, k) => ({ anchor: 'btn', html: `<div class="xt xt--sh3" role="status">${chk}<span>${k === 'share' ? '복사됨' : k === 'save' ? '담음' : '뺌'}</span></div>` }), // 3. 버튼 옆 작은 말풍선(창 없음)
    sh4: (c, k) => ({ html: `<div class="xt xt--sh4" role="status">${k === 'custom' ? '' : chk}<span>${SH_MSG[k]}</span></div>` }),                                              // 4. 위 가운데에서 내려옴
    sh5: (c, k) => ({ html: `<div class="xt xt--sh5" role="status"><i>${chk}</i><div><b>${SH_MSG[k]}</b>${k === 'share' ? `<small>${URLT}</small>` : ''}</div><em></em></div>` }), // 5. 오른쪽 아래 카드(복사한 주소를 보여 줌)
    sh6: (c, k) => ({ html: `<div class="xt xt--sh6" role="status"><i>✓</i><span>${k === 'share' ? 'copied to clipboard' : k === 'save' ? 'saved' : 'removed'}</span><small>${SH_MSG[k]}</small></div>` }), // 6. 터미널 한 줄
    sh7: (c, k) => ({ html: `<div class="xt xt--sh7" role="status">${SK().DEFS}<span>${SK().art('hw:' + (k === 'share' ? '복사됨' : k === 'save' ? '담았어요' : '뺐어요'), c)}</span><em class="er-sr">${SH_MSG[k]}</em></div>` }), // 7. 스티커
    sh8: (c, k) => ({ html: `<div class="xt xt--sh8" role="status">${chk}<span>${SH_MSG[k]}</span>${k === 'share' ? '' : `<button data-toast="되돌렸어요">되돌리기</button>`}</div>` }), // 8. 되돌리기가 붙은 안내 (되돌리기는 지금 없는 기능)
    sh9: (c, k) => (k !== 'share' ? SH.sh1(c, k) : { anchor: 'btn', keep: true, html: `<div class="xt xt--sh9" role="menu" aria-label="공유"><button role="menuitem" data-ex="copy">${c.ic('share', 18)}링크 복사</button><button role="menuitem" data-toast="카카오톡 공유 창이 열려요">${svg('<path d="M12 4C7 4 3 7.100 3 11c0 2.500 1.700 4.700 4.200 5.900L6.400 20l3.700-2.200c.600.100 1.200.100 1.900.100 5 0 9-3.100 9-7s-4-6.900-9-6.900z"/>', 18)}카카오톡</button><button role="menuitem" data-toast="X 공유 창이 열려요">${svg('<path d="M5 5l14 14M19 5L5 19"/>', 18)}X</button></div>` }), // 9. 공유 메뉴 (지금 없는 기능)
    sh10: (c, k) => (k !== 'share' ? SH.sh1(c, k) : { keep: true, html: `<div class="xt xt--sh10" role="dialog" aria-label="공유"><i class="lg-grip"></i><b>공유</b><p class="clamp1">${URLT}</p><div><button data-ex="copy"><span>${c.ic('share', 22)}</span>링크 복사</button><button data-toast="카카오톡 공유 창이 열려요"><span>${svg('<path d="M12 4C7 4 3 7.100 3 11c0 2.500 1.700 4.700 4.200 5.900L6.400 20l3.700-2.200c.600.100 1.200.100 1.900.100 5 0 9-3.100 9-7s-4-6.900-9-6.900z"/>', 22)}</span>카카오톡</button><button data-toast="메일 쓰기 창이 열려요"><span>${c.ic('mail', 22)}</span>메일</button><button data-toast="더 많은 앱이 나와요"><span>${svg('<circle cx="5.500" cy="12" r="1.300" fill="currentColor"/><circle cx="12" cy="12" r="1.300" fill="currentColor"/><circle cx="18.500" cy="12" r="1.300" fill="currentColor"/>', 22)}</span>더 보기</button></div></div>` }), // 10. 아래에서 올라오는 공유 시트 (지금 없는 기능)
  };
  const SH_NAMES = { sh1: '아래 가운데 알약', sh2: '홀로그램 테 알약', sh3: '버튼 옆 말풍선', sh4: '위에서 내려옴', sh5: '오른쪽 아래 카드', sh6: '터미널 한 줄', sh7: '스티커', sh8: '되돌리기 붙은 안내', sh9: '공유 메뉴', sh10: '공유 시트' };

  window.EX = {
    about: (v, c) => (AB[v] || AB.ab1)(c), search: (v, c) => (SR[v] || SR.sr1)(c, smodel(c)), error: (v, c) => (ER[v] || ER.er1)(c, emodel()),
    notice: (v, c) => (NT[v] ? NT[v](c) : ''), noticeAfter: (v) => v === 'nt10', share: (v, c, k) => (SH[v] ? SH[v](c, k) : null), msg: SH_MSG,
    names: { about: AB_NAMES, search: SR_NAMES, error: ER_NAMES, notice: NT_NAMES, share: SH_NAMES },
  };
})();
