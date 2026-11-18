/* 관심 행사(북마크) · 내 정보 화면 시안 (2026-11-17). 각 열 가지.
   기능은 지금 서비스와 같다.
   - 관심 행사(/myevent, 지금 제목 "북마크"): 탭 "진행중 N / 종료 N", 행사 목록, 북마크 버튼을 누르면 목록에서 빠짐, 비었을 때 안내와 "개발자 행사 보러 가기".
   - 내 정보(/myinfo): 프로필 사진·이름·가입일, 가입 계정(이메일), 회원 탈퇴(확인 창). 로그아웃은 헤더의 프로필 메뉴.
   주소 옵션: #saved · #me  ·  ?saved=sv1…sv10  ·  ?me=me1…me10  ·  ?tab=done(종료 탭)  ·  ?empty=1(담은 행사 없음)  ·  ?open=withdraw(탈퇴 확인 창)
   saved(v, ctx) · me(v, ctx) → 헤더 아래 본문 HTML. 탭 전환·빼기·탈퇴 창은 app.js 가 처리한다. */
(function () {
  // 목업용 가짜 회원. 실제로는 useUser()의 username · email · register_date · profile_image_link
  const U = { name: '김데브', email: 'dev.kim@example.com', since: '2025년 03월 14일', sinceShort: '2025.03.14', initial: '김' };
  const SK = () => window.STICKERS || { art: () => '', DEFS: '' };
  const stk = (name, c, x, y, r, s, side) => `<span class="lg-stk" style="${side || 'left'}:${x}px;top:${y}px;--r:${r}deg;--s:${s}">${SK().art(name, c)}</span>`;
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const wcls = (d) => (d.getDay() === 0 ? 'sun' : d.getDay() === 6 ? 'sat' : '');

  /* ---------- 관심 행사: 공통 ---------- */
  const model = (c) => {
    const fav = c.ALL.filter((e) => c.S.fav.has(e.id));
    const on = fav.filter((e) => !e.ended).sort((a, b) => a.keyDate - b.keyDate || a.en - b.en), done = fav.filter((e) => e.ended).sort((a, b) => b.en - a.en);
    const tab = c.S.stab === 'done' ? 'done' : 'ongoing';
    return { on, done, tab, list: tab === 'done' ? done : on, soon: on.filter((e) => c.diffDays(e.keyDate, c.NOW) <= 7).length };
  };
  const tabs = (m, cls) => `<div class="my-tabs ${cls || ''}" role="tablist" aria-label="관심 행사 상태">${[['ongoing', '진행중', m.on.length], ['done', '종료', m.done.length]].map(([k, l, n]) => `<button role="tab" aria-selected="${m.tab === k}" class="${m.tab === k ? 'is-on' : ''}" data-stab="${k}">${l}<i>${n}</i></button>`).join('')}</div>`;
  const fav = (c, e, s) => `<button class="my-fav is-on" data-fav="${e.id}" aria-label="관심 행사에서 빼기" title="관심 행사에서 빼기">${c.ic('bookmark', s || 20)}</button>`;
  const badge = (e) => `<i class="my-dd ${e.ended ? 'is-done' : e.recruit ? 'is-dead' : 'is-open'}">${e.label}</i>`;
  const when = (c, e) => (e.recruit ? `${c.fdw(e.en)}${e.slot.time ? ' ' + e.slot.time : ''} 접수 마감` : e.range);
  const meta = (e) => [...e.mode, e.cost].filter(Boolean).join(' · ');
  const empty = (c, m) => (m.tab === 'done'
    ? `<div class="my-empty"><b>종료된 행사가 없어요</b><p>담아 둔 행사가 끝나면 여기로 옮겨져요.</p></div>`
    : `<div class="my-empty"><span class="my-empty__ic">${c.ic('bookmark', 34)}</span><b>담아 둔 행사가 없어요</b><p>관심 있는 행사를 담아 보세요.</p><a class="my-btn press" href="#main">개발자 행사 보러 가기</a></div>`);
  const head = (m, sub) => `<div class="my-head"><div><h1>관심 행사</h1>${sub ? `<p>${sub}</p>` : ''}</div>${tabs(m)}</div>`;
  // 작은 썸네일이 붙은 한 줄. 여러 시안이 같이 쓴다
  const row = (c, e) => `<article class="my-row${e.ended ? ' is-done' : ''}"><a href="${e.href}"><span class="my-row__img">${c.thumb(e)}</span><span class="my-row__b">${badge(e)}<b class="clamp2">${c.esc(e.title)}</b><small class="clamp1">${c.esc(e.organizer)} · ${when(c, e)}</small></span></a>${fav(c, e)}</article>`;
  const byDay = (list) => { const m = new Map(); list.forEach((e) => { if (!m.has(e.k)) m.set(e.k, { key: e.k, date: new Date(e.keyDate.getFullYear(), e.keyDate.getMonth(), e.keyDate.getDate()), items: [] }); m.get(e.k).items.push(e); }); return [...m.values()]; };
  const page = (v, inner) => `<main class="wrap my sv sv--${v}">${inner}</main>`;

  const SV = {
    // 1. 날짜 타임라인: 행사 일정 화면과 같은 틀(왼쪽 날짜 줄, 오른쪽 카드)
    sv1: (c, m) => page('sv1', head(m) + (m.list.length ? byDay(m.list).map((g) => `<section class="day${g.key < c.TODAY ? ' is-past' : ''}"><div class="day__rail"><div class="day__stick"><b>${c.fd(g.date)}</b><span class="${wcls(g.date)}">${DOW[g.date.getDay()]}요일</span><small>${g.items.length}건</small></div></div><div class="day__list">${g.items.map(c.card).join('')}</div></section>`).join('') : empty(c, m))),

    // 2. 줄 목록: 썸네일 없이 한 줄에 한 행사. 남은 날이 맨 앞
    sv2: (c, m) => page('sv2', head(m) + (m.list.length ? `<p class="sv2__sort">${m.tab === 'done' ? '최근에 끝난 순' : '마감·시작이 빠른 순'}</p><ul class="sv2__l">${m.list.map((e) => `<li class="${e.ended ? 'is-done' : ''}"><a href="${e.href}"><span class="sv2__d">${badge(e)}</span><span class="sv2__m"><b class="clamp1">${c.esc(e.title)}</b><small class="clamp1">${c.esc(e.organizer)} · ${when(c, e)}</small></span><span class="sv2__t">${meta(e)}</span></a>${fav(c, e)}</li>`).join('')}</ul>` : empty(c, m))),

    // 3. 포스터 격자: 썸네일이 주인공
    sv3: (c, m) => page('sv3', head(m) + (m.list.length ? `<div class="sv3__g">${m.list.map((e) => `<article class="${e.ended ? 'is-done' : ''}"><a href="${e.href}"><span class="sv3__img">${c.thumb(e)}</span>${badge(e)}<b class="clamp2">${c.esc(e.title)}</b><small class="clamp1">${when(c, e)}</small></a>${fav(c, e)}</article>`).join('')}</div>` : empty(c, m))),

    // 4. 달력 + 목록: 담아 둔 행사가 있는 날이 달력에 찍힌다
    sv4: (c, m) => {
      if (!m.list.length) return page('sv4', head(m) + empty(c, m));
      const base = m.list[0].keyDate, y = base.getFullYear(), mo = base.getMonth(), first = new Date(y, mo, 1).getDay(), len = new Date(y, mo + 1, 0).getDate();
      const cnt = {}; m.list.forEach((e) => { cnt[e.k] = (cnt[e.k] || 0) + 1; });
      const cells = Array.from({ length: first }, () => '<i></i>').concat(Array.from({ length: len }, (_, i) => { const k = `${y}-${c.pad(mo + 1)}-${c.pad(i + 1)}`, n = cnt[k] || 0; return n ? `<button class="has${k === c.TODAY ? ' is-today' : ''}" data-svday="${k}" aria-label="${mo + 1}월 ${i + 1}일, 담아 둔 행사 ${n}건">${i + 1}<em>${n}</em></button>` : `<span class="${k === c.TODAY ? 'is-today' : ''}">${i + 1}</span>`; }));
      const out = m.list.filter((e) => e.keyDate.getMonth() !== mo || e.keyDate.getFullYear() !== y).length;
      return page('sv4', head(m) + `<div class="sv4__in"><aside class="sv4__cal"><b>${y}년 ${mo + 1}월</b><div class="sv4__w">${DOW.map((d, i) => `<span class="${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}">${d}</span>`).join('')}</div><div class="sv4__g">${cells.join('')}</div>${out ? `<p>다른 달에 ${out}건이 더 있어요. 오른쪽 목록에서 볼 수 있어요.</p>` : ''}</aside>
        <div class="sv4__l">${byDay(m.list).map((g) => `<section id="svd-${g.key}"><h2><span class="${wcls(g.date)}">${c.fdw(g.date)}</span><i>${g.items.length}건</i></h2>${g.items.map((e) => row(c, e)).join('')}</section>`).join('')}</div></div>`);
    },

    // 5. 급한 순 묶음: 오늘 / 일주일 안 / 한 달 안 / 그 뒤
    sv5: (c, m) => {
      if (!m.list.length) return page('sv5', head(m) + empty(c, m));
      const B = m.tab === 'done' ? [['종료된 행사', () => true]] : [['오늘', (d) => d <= 0], ['일주일 안', (d) => d <= 7], ['한 달 안', (d) => d <= 30], ['그 뒤', () => true]];
      const used = new Set();
      const secs = B.map(([label, f]) => { const it = m.list.filter((e) => !used.has(e.id) && f(c.diffDays(e.keyDate, c.NOW))); it.forEach((e) => used.add(e.id)); return it.length ? `<section class="sv5__s"><h2>${label}<i>${it.length}</i></h2><div>${it.map((e) => row(c, e)).join('')}</div></section>` : ''; }).join('');
      return page('sv5', head(m) + secs);
    },

    // 6. 홀로그램 머리띠: 배너·로그인 창과 같은 어두운 스티커 띠에 제목과 탭 (2026-11-17 결정. "담아 둔 행사 ○건 · 일주일 안에…" 요약 문구는 요청으로 뺐다. 건수는 탭에 있다)
    sv6: (c, m) => page('sv6', `<div class="sv6__band">${SK().DEFS}<div class="sv6__stk" aria-hidden="true">${stk('holo:logo', c, 300, 26, -7, 0.9, 'right')}${stk('lg:js:hex:h', c, 196, 18, 9, 0.66, 'right')}${stk('laptop', c, 232, 96, 8, 0.66, 'right')}${stk('prompt', c, 96, 84, -6, 0.78, 'right')}${stk('lg:linux:hex:h', c, 92, 10, 8, 0.66, 'right')}${stk('lg:python:disc:w', c, 22, 62, -10, 0.58, 'right')}</div>
      <div class="sv6__in"><h1>관심 행사</h1>${tabs(m, 'is-dark')}</div></div>
      ${m.list.length ? `<div class="sv6__l">${m.list.map((e) => row(c, e)).join('')}</div>` : empty(c, m)}`),

    // 7. 세 칸 보드: 곧 마감 / 접수 중 / 행사 예정·진행 중
    sv7: (c, m) => {
      if (!m.list.length) return page('sv7', head(m) + empty(c, m));
      const cardS = (e) => `<article class="sv7__c${e.ended ? ' is-done' : ''}"><a href="${e.href}">${badge(e)}<b class="clamp2">${c.esc(e.title)}</b><small class="clamp1">${when(c, e)}</small><em>${meta(e)}</em></a>${fav(c, e, 18)}</article>`;
      if (m.tab === 'done') return page('sv7', head(m) + `<div class="sv7__b is-one"><section><h2>종료<i>${m.list.length}</i></h2><div>${m.list.map(cardS).join('')}</div></section></div>`);
      const soon = m.list.filter((e) => c.diffDays(e.keyDate, c.NOW) <= 3), rest = m.list.filter((e) => !soon.includes(e));
      const cols = [['3일 안', soon, 'is-hot'], ['접수 중', rest.filter((e) => e.recruit), ''], ['행사 예정 · 진행 중', rest.filter((e) => !e.recruit), '']];
      return page('sv7', head(m) + `<div class="sv7__b">${cols.map(([l, it, k]) => `<section class="${k}"><h2>${l}<i>${it.length}</i></h2><div>${it.length ? it.map(cardS).join('') : '<p>해당하는 행사가 없어요</p>'}</div></section>`).join('')}</div>`);
    },

    // 8. 다음 일정 크게: 가장 먼저 다가오는 행사 하나를 크게, 나머지는 줄로
    sv8: (c, m) => {
      if (!m.list.length) return page('sv8', head(m) + empty(c, m));
      const e = m.list[0], rest = m.list.slice(1);
      const big = e.ended ? '종료된 행사예요' : e.recruit ? `마감까지 ${e.remain}` : e.state === '진행 중' ? '지금 진행 중' : e.label === '오늘' ? '오늘 열려요' : `${e.label.replace('D-', '')}일 뒤에 열려요`;
      return page('sv8', head(m) + `<article class="sv8__hero${e.ended ? ' is-done' : ''}"><a class="sv8__img" href="${e.href}">${c.thumb(e)}</a><div class="sv8__b"><span>${m.tab === 'done' ? '가장 최근에 끝난 행사' : '가장 먼저 다가오는 행사'}</span><strong>${big}</strong><a class="sv8__t clamp2" href="${e.href}">${c.esc(e.title)}</a><small>${c.esc(e.organizer)} · ${when(c, e)}</small>
        <div class="sv8__act">${e.ended ? '' : `<a class="my-btn is-ink press" href="${c.esc(e.link)}" target="_blank" rel="noopener">신청하러 가기 ${c.ic('out', 17)}</a>`}<a class="my-btn press" href="${e.href}">자세히 보기</a>${fav(c, e)}</div></div></article>
        ${rest.length ? `<h2 class="sv8__h">${m.tab === 'done' ? '그 전에 끝난 행사' : '그다음'}<i>${rest.length}</i></h2><div class="sv8__l">${rest.map((x) => row(c, x)).join('')}</div>` : ''}`);
    },

    // 9. 기간 띠: 오늘부터 4주를 가로로 펼치고, 행사 기간은 막대로 접수 마감은 점으로
    sv9: (c, m) => {
      if (!m.list.length) return page('sv9', head(m) + empty(c, m));
      if (m.tab === 'done') return SV.sv2(c, m).replace('sv--sv2', 'sv--sv2 sv--sv9');
      const N = 28, days = Array.from({ length: N }, (_, i) => new Date(c.NOW.getFullYear(), c.NOW.getMonth(), c.NOW.getDate() + i));
      const hd = days.map((d, i) => `<span class="${wcls(d)}${i === 0 ? ' is-today' : ''}${i % 7 === 0 ? ' is-wk' : ''}">${d.getDate() === 1 || i === 0 ? `<em>${d.getMonth() + 1}월</em>` : ''}${d.getDate()}</span>`).join('');
      const rowG = (e) => { const a = Math.max(0, c.diffDays(e.s, c.NOW)), b = c.diffDays(e.en, c.NOW), over = b > N - 1;
        const mark = e.recruit ? (over ? `<i class="sv9__far" style="grid-column:${N - 3} / ${N + 1}">${c.fd(e.en)} 마감 →</i>` : `<i class="sv9__dot" style="grid-column:${b + 1}" title="${c.fdw(e.en)} 접수 마감"></i>`)
          : (a > N - 1 ? `<i class="sv9__far" style="grid-column:${N - 3} / ${N + 1}">${c.fd(e.s)} 시작 →</i>` : `<i class="sv9__bar${over ? ' is-over' : ''}" style="grid-column:${a + 1} / ${Math.min(N, b + 1) + 1}" title="${e.range}"></i>`);
        return `<li><a class="sv9__n" href="${e.href}">${badge(e)}<b class="clamp1">${c.esc(e.title)}</b></a><div class="sv9__t">${mark}</div>${fav(c, e, 18)}</li>`; };
      return page('sv9', head(m) + `<div class="sv9__box"><div class="sv9__hd"><span>오늘부터 4주</span><div class="sv9__t">${hd}</div><i></i></div><ul>${m.list.map(rowG).join('')}</ul><p class="sv9__lg"><i class="sv9__bar"></i>행사 기간<i class="sv9__dot"></i>접수 마감</p></div>`);
    },

    // 10. 터미널 목록: 로그인 창 5번과 같은 명령줄 화면
    sv10: (c, m) => page('sv10', `<div class="sv10__w"><div class="my-bar" aria-hidden="true"><i></i><i></i><i></i><span>saved — dev-event</span></div><div class="sv10__b">
      <h1><i>$</i> dev-event saved <span class="sv10__f" role="tablist" aria-label="관심 행사 상태"><button role="tab" aria-selected="${m.tab === 'ongoing'}" class="${m.tab === 'ongoing' ? 'is-on' : ''}" data-stab="ongoing">--upcoming</button><button role="tab" aria-selected="${m.tab === 'done'}" class="${m.tab === 'done' ? 'is-on' : ''}" data-stab="done">--done</button></span></h1>
      <p class="sv10__c"># 관심 행사 · 진행중 ${m.on.length}건, 종료 ${m.done.length}건</p>
      ${m.list.length ? `<ol>${m.list.map((e) => `<li class="${e.ended ? 'is-done' : ''}"><a href="${e.href}"><span class="sv10__d ${e.recruit ? 'is-r' : ''}">${e.label.replace('마감 ', '')}</span><span class="sv10__w">${c.fdw(e.recruit || e.ended ? e.en : e.s)}</span><span class="sv10__k">${e.slot.chip}</span><b class="clamp1">${c.esc(e.title)}</b></a><button data-fav="${e.id}" aria-label="관심 행사에서 빼기">빼기</button></li>`).join('')}</ol><p class="sv10__c"># ${m.list.length}건 · ${m.tab === 'done' ? '최근에 끝난 순' : '마감·시작이 빠른 순'}<b class="sv10__cur"></b></p>`
        : `<p class="sv10__e">${m.tab === 'done' ? '종료된 행사가 없어요.' : '담아 둔 행사가 없어요. 관심 있는 행사를 담아 보세요.'}</p>${m.tab === 'done' ? '' : `<p><i>$</i> <a href="#main">dev-event list</a><b class="sv10__cur"></b></p>`}`}
    </div></div>`),
  };
  const SV_NAMES = { sv1: '날짜 타임라인', sv2: '줄 목록', sv3: '포스터 격자', sv4: '달력과 목록', sv5: '급한 순 묶음', sv6: '홀로그램 머리띠', sv7: '세 칸 보드', sv8: '다음 일정 크게', sv9: '기간 띠', sv10: '터미널 목록' };

  /* ---------- 내 정보: 공통 ---------- */
  const av = (s, cls) => `<span class="my-av ${cls || ''}" style="--s:${s}px" aria-hidden="true">${U.initial}</span>`;
  const mail = (c) => `<span class="me-mail">${c.ic('mail', 17)}${U.email}</span>`;
  const rows = (list) => `<dl class="me-rows">${list.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const DANGER_P = '탈퇴하면 내 정보와 담아 둔 행사가 모두 삭제되고 복구할 수 없어요.';
  const danger = () => `<section class="me-danger"><div><h3>회원 탈퇴</h3><p>${DANGER_P}</p></div><button class="press" data-my="withdraw">탈퇴하기</button></section>`;
  const mpage = (v, inner) => `<main class="wrap my me me--${v}">${inner}</main>`;
  const stats = (c) => { const m = model(c); return { m, n: m.on.length, soon: m.soon, done: m.done.length }; };

  // 관심 행사 6번의 띠와 같은 스티커 배치
  const BAND = (c) => stk('holo:logo', c, 300, 26, -7, 0.9, 'right') + stk('lg:js:hex:h', c, 196, 18, 9, 0.66, 'right') + stk('laptop', c, 232, 96, 8, 0.66, 'right') + stk('prompt', c, 96, 84, -6, 0.78, 'right') + stk('lg:linux:hex:h', c, 92, 10, 8, 0.66, 'right') + stk('lg:python:disc:w', c, 22, 62, -10, 0.58, 'right');
  const ME = {
    // 1. 기본 카드: 지금 화면의 구성(프로필, 계정 정보, 회원 탈퇴) 그대로
    me1: (c) => mpage('me1', `<h1 class="me-h">내 정보</h1><section class="me-card me1__p">${av(76)}<div><b>${U.name}</b><span>${U.since}<i>가입일</i></span></div></section>
      <section class="me-card"><h2>계정 정보</h2>${rows([['가입 계정', mail(c)]])}</section>${danger()}`),

    // 2. 홀로그램 머리띠: 로그인 창(2번)과 같은 띠. 프로필 사진이 띠에 걸친다
    me2: (c) => mpage('me2', `<div class="me2__c"><div class="me2__band" aria-hidden="true">${SK().DEFS}${stk('holo:logo', c, 26, 34, -7, 0.9)}${stk('lg:js:hex:h', c, 196, 14, 9, 0.62)}${stk('prompt', c, 150, 62, -6, 0.74, 'right')}${stk('lg:linux:hex:h', c, 84, 10, 8, 0.64, 'right')}${stk('lg:python:disc:w', c, 26, 70, -10, 0.54, 'right')}</div>
      <div class="me2__b">${av(96, 'is-ring')}<h1>${U.name}</h1><p>${U.since} 가입</p>${rows([['가입 계정', mail(c)]])}
      <div class="me2__d"><span>${DANGER_P}</span><button data-my="withdraw">회원 탈퇴</button></div></div></div>`),

    // 2A. 넓은 띠 · 프로필이 띠 안에: 관심 행사(6번)와 같은 화면 폭의 띠. 띠 안에 사진·이름·가입일, 그 아래 두 칸에 계정 정보와 회원 탈퇴 (2026-11-17 추가)
    me2a: (c) => mpage('me2a', `<div class="sv6__band">${SK().DEFS}<div class="sv6__stk" aria-hidden="true">${BAND(c)}</div><div class="sv6__in me2a__in">${av(84, 'is-line')}<div><h1>${U.name}</h1><p>${U.since} 가입</p></div></div></div>
      <div class="me2w__g"><section class="me-card"><h2>계정 정보</h2>${rows([['가입 계정', mail(c)]])}</section>${danger()}</div>`),

    // 2B. 넓은 띠 · 제목이 띠 안에: 띠에는 관심 행사처럼 화면 제목("내 정보")만. 사진이 띠 아래로 걸치고 이름은 그 옆 (2026-11-17 추가)
    me2b: (c) => mpage('me2b', `<div class="sv6__band">${SK().DEFS}<div class="sv6__stk" aria-hidden="true">${BAND(c)}</div><div class="sv6__in"><h1>내 정보</h1></div></div>
      <div class="me2b__p">${av(96, 'is-ring')}<div><b>${U.name}</b><span>${U.since} 가입</span></div></div>
      <div class="me2w__g"><section class="me-card"><h2>계정 정보</h2>${rows([['가입 계정', mail(c)]])}</section>${danger()}</div>`),

    // 3. 행사 명찰: 컨퍼런스에서 목에 거는 명찰
    me3: (c) => mpage('me3', `<div class="me3__badge" aria-hidden="true"><i class="me3__strap"></i><i class="me3__clip"></i><div class="me3__card"><span class="me3__top">DEV.EVENT<em>MEMBER</em></span>${av(88)}<b>${U.name}</b><small>${U.email}</small><span class="me3__holo">SINCE ${U.sinceShort}</span></div></div>
      <div class="me3__side"><h1 class="me-h">내 정보</h1>${rows([['이름', U.name], ['가입일', U.since], ['가입 계정', mail(c)]])}${danger()}</div>`),

    // 4. 두 칸: 왼쪽에 프로필, 오른쪽에 내용
    me4: (c) => mpage('me4', `<aside class="me4__a">${av(148)}<h1>${U.name}</h1><p>${U.since} 가입</p></aside>
      <div class="me4__b"><section><h2>계정 정보</h2>${rows([['가입 계정', mail(c)], ['가입일', U.since]])}</section><section><h2>회원 탈퇴</h2><p>${DANGER_P}</p><button class="me4__x press" data-my="withdraw">탈퇴하기</button></section></div>`),

    // 5. 설정 줄 목록: 한 줄에 한 항목
    me5: (c) => { const s = stats(c); return mpage('me5', `<h1 class="me-h">내 정보</h1><div class="me5__p">${av(64)}<div><b>${U.name}</b><span>${U.email}</span></div></div>
      <h2>계정</h2><ul class="me5__l"><li><span>이름</span><em>${U.name}</em></li><li><span>가입 계정</span><em>${U.email}</em></li><li><span>가입일</span><em>${U.since}</em></li></ul>
      <h2>바로 가기</h2><ul class="me5__l"><li><a href="#saved"><span>관심 행사</span><em>${s.n}건</em>${c.ic('chevron', 18)}</a></li><li><button data-my="logout"><span>로그아웃</span></button></li></ul>
      <ul class="me5__l is-red"><li><button data-my="withdraw"><span>회원 탈퇴</span>${c.ic('chevron', 18)}</button></li></ul><p class="me5__n">${DANGER_P}</p>`); },

    // 6. 터미널: whoami
    me6: (c) => mpage('me6', `<div class="me6__w"><div class="my-bar" aria-hidden="true"><i></i><i></i><i></i><span>account — dev-event</span></div><div class="me6__b">
      <h1><i>$</i> whoami</h1><p class="o">${U.name}</p>
      <p><i>$</i> dev-event account</p><dl><div><dt>name</dt><dd>${U.name}</dd></div><div><dt>email</dt><dd>${U.email}</dd></div><div><dt>joined</dt><dd>${U.since}</dd></div></dl>
      <p><i>$</i> <button data-my="logout">dev-event logout</button></p>
      <p><i>$</i> <button class="is-red" data-my="withdraw">dev-event account --delete</button><b class="sv10__cur"></b></p><p class="c"># ${DANGER_P}</p></div></div>`),

    // 7. 검정 회원 카드: 홀로그램 테를 두른 카드 한 장
    me7: (c) => mpage('me7', `<h1 class="me-h">내 정보</h1><div class="me7__card"><span class="me7__logo">DEV.EVENT</span><span class="me7__chip" aria-hidden="true"></span><b>${U.name}</b><small>${U.email}</small><em>MEMBER SINCE<br>${U.sinceShort}</em></div>
      ${rows([['가입 계정', mail(c)], ['가입일', U.since]])}${danger()}`),

    // 8. 요약 숫자: 담아 둔 행사 수와 가장 가까운 일정을 함께
    me8: (c) => { const s = stats(c), e = s.m.on[0]; return mpage('me8', `<div class="me8__p">${av(72)}<div><h1>${U.name}</h1><p>${U.since} 가입</p></div></div>
      <div class="me8__s"><a href="#saved"><b>${s.n}</b><span>담아 둔 행사</span></a><a href="#saved"><b>${s.soon}</b><span>일주일 안에 마감·시작</span></a><a href="#saved" data-stab-go="done"><b>${s.done}</b><span>종료된 행사</span></a></div>
      ${e ? `<a class="me8__n" href="${e.href}"><span>가장 먼저 다가오는 행사</span><b class="clamp1">${c.esc(e.title)}</b><small>${when(c, e)}</small>${badge(e)}</a>` : ''}
      <section class="me-card"><h2>계정 정보</h2>${rows([['가입 계정', mail(c)]])}</section>${danger()}`); },

    // 9. 한 화면에 탭: 관심 행사와 내 정보를 한 화면의 두 탭으로
    me9: (c) => { const s = stats(c), t = c.S.metab === 'saved' ? 'saved' : 'info'; return mpage('me9', `<div class="me9__p">${av(64)}<div><h1>${U.name}</h1><p>${U.email}</p></div></div>
      <div class="me9__t" role="tablist" aria-label="내 계정"><button role="tab" aria-selected="${t === 'saved'}" class="${t === 'saved' ? 'is-on' : ''}" data-my="tab:saved">관심 행사<i>${s.n}</i></button><button role="tab" aria-selected="${t === 'info'}" class="${t === 'info' ? 'is-on' : ''}" data-my="tab:info">내 정보</button></div>
      ${t === 'saved' ? (s.m.on.length ? `<div class="me9__l">${s.m.on.slice(0, 5).map((e) => row(c, e)).join('')}</div><a class="me9__more" href="#saved">관심 행사 ${s.n}건 모두 보기 ${c.ic('chevron', 16)}</a>` : empty(c, s.m))
        : `${rows([['이름', U.name], ['가입 계정', mail(c)], ['가입일', U.since]])}${danger()}`}`); },

    // 10. 스티커 프로필: 프로필 사진과 이름이 스티커가 된다
    me10: (c) => mpage('me10', `<div class="me10__top">${SK().DEFS}<div class="me10__stk" aria-hidden="true">${stk('lg:js:hex:h', c, 40, 30, -10, 0.8)}${stk('laptop', c, 120, 150, 8, 0.8)}${stk('holo:code', c, 10, 190, -6, 0.7)}${stk('prompt', c, 40, 36, 7, 0.9, 'right')}${stk('lg:linux:hex:h', c, 150, 150, -8, 0.8, 'right')}${stk('lg:python:disc:w', c, 20, 196, 9, 0.66, 'right')}</div>
      <div class="me10__me"><span class="me10__av">${U.initial}</span><span class="me10__nm">${SK().art('hw:' + U.name, c)}</span><p>${U.since} 가입</p></div></div>
      ${rows([['가입 계정', mail(c)]])}${danger()}`),
  };
  const ME_NAMES = { me1: '기본 카드', me2: '홀로그램 머리띠', me2a: '넓은 띠 · 프로필이 띠 안에', me2b: '넓은 띠 · 제목이 띠 안에', me3: '행사 명찰', me4: '두 칸', me5: '설정 줄 목록', me6: '터미널', me7: '검정 회원 카드', me8: '요약 숫자', me9: '한 화면에 탭', me10: '스티커 프로필' };

  // 탈퇴 확인 창. 문구는 지금 서비스의 것
  const withdraw = () => `<div class="my-mdl" data-my-root><div class="my-mdl__c" role="alertdialog" aria-modal="true" aria-label="회원 탈퇴 확인" tabindex="-1"><b>정말 탈퇴하시겠습니까?</b><p>탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다.<br>삭제된 정보는 다시 복구할 수 없습니다.</p><div><button class="press" data-my="cancel">취소</button><button class="is-red press" data-my="confirm">탈퇴하기</button></div></div></div>`;

  window.MY = { saved: (v, c) => (SV[v] || SV.sv1)(c, model(c)), me: (v, c) => (ME[v] || ME.me1)(c), withdraw, user: U, svIds: Object.keys(SV), svNames: SV_NAMES, meIds: Object.keys(ME), meNames: ME_NAMES };
})();
