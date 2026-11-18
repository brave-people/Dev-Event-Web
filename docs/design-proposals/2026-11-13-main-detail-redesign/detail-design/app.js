/* 02 날짜 타임라인 — 상세 설계 목업. 실제 구현 코드가 아니라 동작을 보여 주기 위한 스크립트다.
   주소 뒤 옵션: ?reg=0…3(등록된 배너 수. 1 이상이면 등록 배너가 보인다)  &bc=배경색(# 없이, 첫 배너의 background_color를 바꿔 보기)
   &banner=등록된 배너가 없을 때의 모습: solid|wall|bars|names|paper|self|stage|board|seats|ascii|keys|sticker|ticket|aurora|speed|burst|pixel|lines|slash · 스티커 묶음 stk1…stk7 · 홀로그램 묶음 holo1…holo6 · 이전 비교안 none|slim|line|live|pick|hero|type|search|ticker|count|sheet|blocks|tiles|posters|grass|note
   &new=thumb|title|n  &theme=light|dark  &only=new  &past=1  &q=검색어  &foot=f0…f10  &bare=1|foot|top */
(function () {
  const NOW = new Date('2026-11-13T10:00:00'); // 언제 열어도 같은 화면이 나오도록 고정
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const pad = (n) => String(n).padStart(2, '0');
  const day0 = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = (a, b) => Math.round((day0(a) - day0(b)) / 864e5);
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d || 1); };
  const fd = (d) => `${d.getMonth() + 1}.${d.getDate()}`;
  const fdw = (d) => `${fd(d)}(${DOW[d.getDay()]})`;
  const ft = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const wcls = (d) => (d.getDay() === 0 ? 'sun' : d.getDay() === 6 ? 'sat' : '');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TODAY = key(NOW);
  const TOPIC = ['AI', '클라우드', '블록체인', '보안', '기술일반'];
  const MODE = ['온라인', '오프라인'], COST = ['무료', '유료'], KIND = ['세미나', '모임', '대회', '교육', '커뮤니티'];

  const Q = new URLSearchParams(location.search);
  // &login=로그인 창 시안 l1…l10 · &open=login(열린 채로 시작) · &saved=관심 행사 시안 sv1…sv10 · &me=내 정보 시안 me1…me10
  // &about=소개 ab1…ab10 · &sr=검색 결과 sr1…sr10 · &err=오류 화면 er1…er10 · &notice=공지 띠 nt1…nt10 · &share=공유 안내 sh1…sh10
  const OPT = { about: Q.get('about') || 'ab10', sr: Q.get('sr') || 'sr1', err: Q.get('err') || 'er9', share: Q.get('share') || 'sh4',
    // 2026-11-17 결정: 검색 결과 sr1 · 오류 화면 er9 · 공지 띠 nt2 · 공유 안내 sh4. 소개는 지금 화면을 유지하기로 해서 목업에서는 가장 가까운 ab10을 보여 준다.
    // 공지 띠는 설명 페이지의 예전 미리보기(x= 나 bare= 가 붙은 주소)에서는 띄우지 않는다. 띠 높이만큼 화면이 밀려 잘라 보여 주는 자리가 어긋나기 때문이다. ?notice= 로 비우면 띠 없이 볼 수 있다
    notice: Q.has('notice') ? Q.get('notice') : (Q.has('x') || Q.has('bare') ? '' : 'nt2'), saved: Q.get('saved') || 'sv6', me: Q.get('me') || 'me2', login: Q.get('login') || 'l2', banner: Q.get('banner') || 'holo1', nw: Q.get('new') || 'title', theme: Q.get('theme') || 'light', foot: Q.get('foot') || 'f2' };
  // 등록된 배너 수. 주소에 banner= 만 있으면 '등록된 배너가 없을 때'를 보려는 것이므로 0으로 둔다.
  OPT.reg = Q.has('reg') ? Math.max(0, Math.min(3, Number(Q.get('reg')) || 0)) : (Q.has('banner') ? 0 : 2);
  document.documentElement.dataset.theme = OPT.theme;
  if (Q.get('dw')) document.documentElement.dataset.dw = Q.get('dw'); // 상세 화면 왼쪽 칸 폭 비교: w400(처음 안) · a(360). 없으면 320(결정)
  if (Q.get('bare')) document.documentElement.dataset.bare = Q.get('bare'); // 설명 페이지에서 일부만 잘라 보여 줄 때: 1(카드만) · foot(구독·푸터만) · top(헤더·배너만)

  const PATHS = {
    bookmark: '<path d="M6.5 4h11v16.5l-5.5-3.8-5.5 3.8z"/>', share: '<path d="M12 3.5v11M7.5 8L12 3.5 16.5 8M5 13.5V20h14v-6.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', chevron: '<path d="M9 5l7 7-7 7"/>', back: '<path d="M15 5l-7 7 7 7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>', out: '<path d="M8 16L18 6M9.5 6H18v8.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 00-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 019.5 4 7 7 0 1020 14.5z"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11.2v5.3"/><circle cx="12" cy="7.9" r=".7" fill="currentColor"/>', rows: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.6" cy="6.5" r=".8" fill="currentColor"/><circle cx="4.6" cy="12" r=".8" fill="currentColor"/><circle cx="4.6" cy="17.5" r=".8" fill="currentColor"/>',
    insta: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6" fill="currentColor"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="M4.500 8l7.500 5 7.500-5"/>', zoom: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.600-3.600M11 8v6M8 11h6"/>',
    github: '<path d="M9 19c-4 1.200-4-2-6-2.500M15 21v-3.500c0-1 .100-1.400-.500-2 2.800-.300 5.500-1.400 5.500-6a4.600 4.600 0 00-1.300-3.200 4.200 4.200 0 00-.100-3.200s-1.100-.300-3.500 1.300a12 12 0 00-6.200 0C6.500 2.800 5.400 3.100 5.400 3.100a4.200 4.200 0 00-.100 3.200A4.600 4.600 0 004 9.500c0 4.600 2.700 5.700 5.500 6-.600.600-.600 1.200-.500 2V21"/>',
  };
  const ic = (n, s) => `<svg class="ic" width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[n] || ''}</svg>`;

  function enrich(e) {
    const s = new Date(e.start), en = new Date(e.end), recruit = e.type === 'RECRUIT';
    const ended = en < NOW, left = diffDays(en, NOW), toStart = diffDays(s, NOW);
    const st = e.useStart !== 'N', et = e.useEnd !== 'N', sameDay = key(s) === key(en);
    let state, label;
    if (ended) { state = '종료'; label = '종료'; }
    else if (recruit) { state = '접수 중'; label = left <= 0 ? '오늘 마감' : `마감 D-${left}`; }
    else if (s > NOW) { state = '예정'; label = toStart <= 0 ? '오늘' : `D-${toStart}`; }
    else { state = '진행 중'; label = '진행 중'; }
    // 타임라인에 놓이는 날: 접수형은 마감일, 일시형은 시작일(진행 중이면 오늘, 끝났으면 끝난 날)
    const keyDate = recruit || ended ? en : s > NOW ? s : NOW;
    const ms = en - NOW, h = Math.floor(ms / 36e5);
    const remain = ms <= 0 ? '' : h < 24 ? `${h}시간 ${Math.floor((ms % 36e5) / 6e4)}분` : `${Math.floor(h / 24)}일 ${h % 24}시간`;
    const range = sameDay ? `${fdw(s)}${st ? ' ' + ft(s) : ''}${et ? ' ~ ' + ft(en) : ''}` : `${fdw(s)}${st ? ' ' + ft(s) : ''} ~ ${fdw(en)}${et ? ' ' + ft(en) : ''}`;
    let slot;
    if (ended) slot = { c: 's-done', chip: recruit ? '접수 종료' : '행사 종료', time: '', extra: '' };
    else if (recruit) slot = { c: 's-dead', chip: '접수 마감', time: et ? ft(en) : '', extra: '' };
    else if (s > NOW) slot = { c: 's-open', chip: '행사', time: st && (sameDay || ft(s) !== '00:00') ? ft(s) + (sameDay && et ? ' ~ ' + ft(en) : '') : '', extra: sameDay ? '' : `${fdw(en)}까지` };
    else slot = { c: 's-open', chip: '진행 중', time: '', extra: `${fdw(en)}까지` };
    const text = e.descHtml.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    return Object.assign({}, e, {
      s, en, recruit, ended, state, label, keyDate, k: key(keyDate), remain, range, slot, sameDay,
      progress: Math.max(0, Math.min(1, (NOW - s) / (en - s || 1))),
      mode: e.tags.filter((t) => MODE.includes(t)), cost: e.tags.find((t) => COST.includes(t)) || '', kind: e.tags.find((t) => KIND.includes(t)) || '행사', topics: e.tags.filter((t) => TOPIC.includes(t)),
      isNew: !ended && diffDays(NOW, new Date(e.created)) <= 3, excerpt: text.slice(0, 120),
      initial: (e.organizer || '?').replace(/^[\[\(\s]+/, '').slice(0, 1), href: `#detail/${e.id}`,
    });
  }
  const ALL = (window.MOCK_EVENTS || []).map(enrich);
  const UP = ALL.filter((e) => !e.ended);
  const S = { topic: '전체', mode: '전체', cost: '전체', newOnly: false, q: '', showPast: false, month: TODAY.slice(0, 7), active: TODAY, mp: false, fav: new Set(), bannerOff: false, pick: 0,
    view: Q.get('view') === 'cal' ? 'cal' : 'tl', cday: TODAY, info: Q.get('info') === '1',
    auth: false, stab: Q.get('tab') === 'done' ? 'done' : 'ongoing', metab: Q.get('metab') === 'saved' ? 'saved' : 'info' }; // view: tl(타임라인) · cal(캘린더), cday: 캘린더에서 고른 날, info: 달력 설명 풍선
  if (/^\d{4}-\d\d-\d\d$/.test(Q.get('day') || '')) { S.cday = Q.get('day'); S.month = S.cday.slice(0, 7); }
  // 설명 페이지에서 특정 상태로 바로 열기 위한 옵션: ?only=new  ?past=1  ?q=검색어  ?view=cal(캘린더 보기)  ?day=2026-11-20(캘린더에서 고른 날)  ?info=1(달력 설명 풍선 열림)
  if (Q.get('only') === 'new') S.newOnly = true;
  if (Q.get('past') === '1') S.showPast = true;
  if (Q.get('q')) S.q = Q.get('q');
  const CNT = { today: UP.filter((e) => e.recruit && diffDays(e.en, NOW) <= 0).length, week: UP.filter((e) => !e.recruit && diffDays(e.keyDate, NOW) <= 7).length, fresh: UP.filter((e) => e.isNew).length };

  function filtered() {
    const q = S.q.trim().toLowerCase();
    return ALL.filter((e) => (S.topic === '전체' || e.topics.includes(S.topic)) && (S.mode === '전체' || e.mode.includes(S.mode)) && (S.cost === '전체' || e.cost === S.cost) && (!S.newOnly || e.isNew) && (!q || (e.title + ' ' + e.organizer).toLowerCase().includes(q)));
  }
  function groups() {
    const m = new Map();
    filtered().slice().sort((a, b) => a.keyDate - b.keyDate || a.en - b.en).forEach((e) => { if (!m.has(e.k)) m.set(e.k, { key: e.k, date: day0(e.keyDate), items: [] }); m.get(e.k).items.push(e); });
    return [...m.values()].sort((a, b) => a.key.localeCompare(b.key));
  }

  // 썸네일이 없는 행사는 회색 빈칸 대신 제목으로 표지를 만들어 보여 준다(유형별 색).
  const thumb = (e, cls) => e.img
    ? `<span class="k-thumb ${cls || ''}"><b class="k-thumb__ph">DEV.EVENT</b><i style="background-image:url('${esc(e.img)}')"></i></span>`
    : `<span class="k-thumb k-auto k-auto--${Math.max(0, KIND.indexOf(e.kind))} ${cls || ''}"><span><em>${e.kind} · ${e.mode.join('·')}</em><b>${esc(e.title)}</b><small>${esc(e.organizer)}</small></span></span>`;
  const tags = (e) => `<div class="tags">${[...e.mode, e.cost, e.kind, ...e.topics].filter(Boolean).map((t) => `<span>${t}</span>`).join('')}</div>`;

  let VIEW = 'main';
  const header = () => `
<header class="hd"><div class="hd__in">
  <a class="logo" href="#main">DEV.EVENT</a>
  <nav class="nav"><a class="${VIEW === 'main' || VIEW === 'detail' ? 'is-on' : ''}" href="#main">행사 일정</a><a class="${VIEW === 'saved' ? 'is-on' : ''}" href="#saved">관심 행사</a><a class="${VIEW === 'about' ? 'is-on' : ''}" href="#about">데브이벤트 소개</a></nav>
  <div class="hd__r"><button class="icb" data-act="theme" aria-label="밝은 화면, 어두운 화면 바꾸기">${ic(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon')}</button><button class="btn-line press" data-toast="행사 등록 요청 화면으로 이동해요">행사 등록 요청</button>${S.auth ? `<div class="pm"><button class="pm__b" data-act="pmenu" aria-haspopup="menu" aria-expanded="false" aria-label="프로필 메뉴 열기">${window.MY ? window.MY.user.initial : ''}</button><div class="pm__m" role="menu"><a role="menuitem" href="#saved">관심 행사</a><a role="menuitem" href="#me">내 정보</a><button role="menuitem" data-my="logout">로그아웃</button></div></div>` : '<button class="btn-ink press" data-act="login" aria-haspopup="dialog">로그인</button>'}</div>
</div></header>`;

  // 배너 배경: 지금의 물결 영상을 코드(SVG)로 다시 그린 것. 한 주기(400)만큼 옆으로 밀어 끊김 없이 반복한다.
  function waves() {
    const mk = (amp, y) => { let d = `M-400 ${y}`; for (let x = -400; x < 2400; x += 400) d += ` Q${x + 100} ${y - amp} ${x + 200} ${y} T${x + 400} ${y}`; return d + ' V240 H-400 Z'; };
    return `<svg class="wv" viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true"><defs>
      <linearGradient id="wg1" x1="0" x2="1"><stop offset="0" stop-color="#4f86ff" stop-opacity=".5"/><stop offset="1" stop-color="#78cdff" stop-opacity=".3"/></linearGradient>
      <linearGradient id="wg2" x1="0" x2="1"><stop offset="0" stop-color="#78cdff" stop-opacity=".22"/><stop offset="1" stop-color="#3d6dff" stop-opacity=".42"/></linearGradient></defs>
      <g style="--d:22s"><path d="${mk(30, 96)}" fill="url(#wg2)"/></g><g class="rev" style="--d:30s"><path d="${mk(22, 132)}" fill="url(#wg1)"/></g><g style="--d:13s"><path d="${mk(13, 168)}" fill="rgba(255,255,255,.12)"/></g></svg>`;
  }
  const V = window.VARIANTS || {};
  const CTX = { NOW, DOW, pad, fd, fdw, ft, esc, ic, thumb, waves, UP, ALL, CNT, S, OPT, diffDays, key, TODAY };
  const PICKS = [3489, 3475, 3557, 3541, 3426].map((id) => UP.find((e) => e.id === id && e.img)).filter(Boolean).slice(0, 3);
  // 등록 배너: 서버의 GET /banner/top 응답 모양 그대로(title, banner_image, event_link, background_color). 우선순위(priority)가 높은 순으로 온다.
  // 운영에는 등록된 배너가 없어서(2026-11-16 확인, 빈 배열) 목업용으로 지어낸 값이다.
  const REG = [
    { id: 3, priority: 30, title: 'AWS Community Day Seoul 2026, 참가 신청을 받고 있어요', background_color: '#0d1330', ev: 3489 },
    { id: 2, priority: 20, title: 'PyTorch Day Korea 2026, 접수 마감이 사흘 남았어요', background_color: '#c8321b', ev: 3475 },
    { id: 1, priority: 10, title: 'Notion AI Hackathon Seoul, 반복 업무를 에이전트에게', background_color: '#f1ede4', ev: 3557 },
  ].map((b) => { const e = ALL.find((x) => x.id === b.ev && x.img) || UP.find((x) => x.img); return Object.assign(b, { banner_image: e.img, event_link: e.href }); }).slice(0, OPT.reg);
  if (Q.get('bc') && REG[0]) REG[0].background_color = '#' + Q.get('bc');
  // 배경색에 맞춰 글자색을 고른다. 검정과 흰색 중 대비가 큰 쪽. 값이 색 형식이 아니면 null(기본 남색으로 대체).
  function tone(hex) {
    const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim()); if (!m) return null;
    const h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return { bg: '#' + h, fg: 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? '#101216' : '#ffffff' };
  }
  function regBanner() {
    const n = REG.length, i = S.pick % n, b = REG[i], c = tone(b.background_color) || { bg: '#000040', fg: '#ffffff' };
    const pager = n > 1 ? `<button data-act="pk-" aria-label="이전 배너">${ic('back', 16)}</button><span>${i + 1} / ${n}</span><button data-act="pk+" aria-label="다음 배너">${ic('chevron', 16)}</button>` : '';
    return `<section class="tbn" style="--tbn-bg:${c.bg};--tbn-fg:${c.fg}" aria-label="추천 행사"><div class="tbn__in">
      <div class="tbn__t"><small>추천 행사</small><h2 class="clamp2">${esc(b.title)}</h2><div class="tbn__pg"><a class="tbn__go press" href="${b.event_link}">자세히 보기</a>${pager}</div></div>
      <a class="tbn__img" href="${b.event_link}" tabindex="-1" aria-hidden="true"><img src="${esc(b.banner_image)}" alt=""></a></div></section>`;
  }
  function banner() {
    if (REG.length) return regBanner();
    if (S.bannerOff || OPT.banner === 'none') return '';
    if (V.banners && V.banners[OPT.banner]) return V.banners[OPT.banner](CTX);
    const x = `<button class="bn__x" data-act="bnx" aria-label="배너 닫기">${ic('x', 18)}</button>`;
    const head = CNT.today ? `오늘 마감하는 행사가 <em>${CNT.today}건</em> 있어요` : `이번 주에 열리는 행사가 <em>${CNT.week}건</em> 있어요`;
    if (OPT.banner === 'line') return `<section class="bn bn--line">${waves()}<div class="bn__in"><button class="ln press" data-act="today"><b>${head}</b>${ic('chevron', 16)}</button><div class="lnk"><button class="press" data-act="today">이번 주 열리는 행사 ${CNT.week}</button><button class="press" data-act="new">새로 올라온 행사 ${CNT.fresh}</button></div></div>${x}</section>`;
    if (OPT.banner === 'slim') return `<section class="bn bn--slim">${waves()}<div class="bn__in"><b>개발자 행사는 모두 Dev Event 웹에서</b><span>진행 중인 행사부터 종료된 행사까지, 놓치지 마세요!</span></div>${x}</section>`;
    if (OPT.banner === 'hero') return `<section class="bn bn--hero">${waves()}<div class="bn__in"><div><h2>개발자 행사는<br>모두 Dev Event 웹에서</h2><p>진행 중인 행사부터 종료된 행사까지, 놓치지 마세요!</p></div></div></section>`;
    if (OPT.banner === 'pick') {
      const e = PICKS[S.pick % PICKS.length];
      return `<section class="bn bn--pick">${waves()}<div class="bn__in"><div><small>이번 주 추천 행사</small><h2 class="clamp2">${esc(e.title)}</h2><p>${esc(e.organizer)} · ${e.recruit ? fdw(e.en) + ' ' + ft(e.en) + '까지 접수' : e.range}</p>
        <div class="pg"><a class="go press" href="${e.href}">자세히 보기</a><button data-act="pk-" aria-label="이전 추천">${ic('back', 16)}</button><span>${(S.pick % PICKS.length) + 1} / ${PICKS.length}</span><button data-act="pk+" aria-label="다음 추천">${ic('chevron', 16)}</button></div></div>
        <a href="${e.href}">${thumb(e)}</a></div></section>`;
    }
    return `<section class="bn bn--live">${waves()}<div class="bn__in"><div><small>${NOW.getMonth() + 1}월 ${NOW.getDate()}일 ${DOW[NOW.getDay()]}요일</small><h2>${head}</h2></div>
      <div class="stats"><button class="stat press" data-act="today"><span>오늘 마감</span><b>${CNT.today}<u>건</u></b></button><button class="stat press" data-act="today"><span>이번 주<i> 열리는</i> 행사</span><b>${CNT.week}<u>건</u></b></button><button class="stat press" data-act="new"><span>새<i>로 올라온</i> 행사</span><b>${CNT.fresh}<u>건</u></b></button></div></div>${x}</section>`;
  }

  const SUB = () => (V.foots && V.foots[OPT.foot] ? V.foots[OPT.foot](CTX) : SUB0());
  const SUB0 = () => `
<section class="sub"><div class="sub__in">
  <div><h2>매주 데브이벤트 소식을 받아보세요</h2><p>일요일 저녁 8시, 한 주의 개발자 행사를 메일로 보내드려요.</p>
    <a class="cta press" href="https://github.com/brave-people/Dev-Event-Subscribe" target="_blank" rel="noopener">${ic('mail')} 무료 구독하기</a></div>
  <div class="sns">
    <a href="https://www.threads.com/@dev.event.official" target="_blank" rel="noopener"><i>@</i><div><small>THREADS</small><b>새 행사 소식, 가장 먼저 받기</b></div><span>보러가기 →</span></a>
    <a href="https://www.instagram.com/dev.event.official/" target="_blank" rel="noopener"><i class="ig">${ic('insta', 22)}</i><div><small>INSTAGRAM</small><b>익숙한 피드에서 행사 소식 받기</b></div><span>보러가기 →</span></a>
  </div>
</div></section>
<footer class="ftr"><div class="ftr__in">
  <div><a class="logo" href="#main">DEV.EVENT</a><p>개발자를 위한 행사 정보, 데브이벤트</p><small>ⓒ 2022. <a href="https://github.com/brave-people/Dev-Event" target="_blank" rel="noopener">용감한 친구들 with 남송리 삼번지</a> all rights reserved.</small></div>
  <div class="ftr__l"><a href="#main" data-toast="데브이벤트 소개 화면으로 이동해요">데브이벤트 소개</a><a href="#main" data-toast="행사 등록 요청 화면으로 이동해요">행사 등록 요청</a><a class="ico" href="https://github.com/brave-people/Dev-Event" target="_blank" rel="noopener" aria-label="GitHub">${ic('github')}</a><a class="ico" href="https://store.whale.naver.com/detail/dfhagfnmecmkhdoeggeokfmmkbpiahek" target="_blank" rel="noopener" aria-label="네이버 웨일 확장 프로그램" style="font-weight:800;font-size:13px">W</a></div>
</div></footer>`;

  /* ---------- 메인 ---------- */
  function navHtml() {
    const [y, m] = S.month.split('-').map(Number);
    const cnt = {}; filtered().forEach((e) => { cnt[e.k] = (cnt[e.k] || 0) + 1; });
    // 날짜 띠: 오늘부터 시작한다(지난 날짜는 '지난 행사 보기'를 켰을 때만). 한 화면에 PC 14일, 모바일 7일이 보이고 나머지는 옆으로 넘긴다.
    const keysAll = ALL.map((e) => e.k).sort(), t0 = day0(NOW);
    const from = S.showPast && keysAll[0] < TODAY ? new Date(keysAll[0] + 'T00:00:00') : t0;
    const lastK = keysAll[keysAll.length - 1] || TODAY, minEnd = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + 13);
    const to = new Date(lastK + 'T00:00:00') > minEnd ? new Date(lastK + 'T00:00:00') : minEnd;
    let cells = '';
    for (let dt = new Date(from); dt <= to; dt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1)) {
      const k = key(dt), c = cnt[k] || 0, d = dt.getDate(), mm = dt.getMonth() + 1;
      // 달이 바뀌는 1일에는 요일 대신 'N월'을 적어 경계를 알린다
      cells += `<button class="rc${k === TODAY ? ' is-today' : ''}${k === S.active ? ' is-on' : ''}${c ? '' : ' is-empty'}${k < TODAY ? ' is-past' : ''}${d === 1 ? ' is-first' : ''}" ${c ? `data-day="${k}"` : 'disabled'} aria-label="${mm}월 ${d}일 ${DOW[dt.getDay()]}요일, 행사 ${c}건${k === TODAY ? ', 오늘' : ''}"><span class="${wcls(dt)}">${d === 1 ? `${mm}월` : DOW[dt.getDay()]}</span><b>${d}</b><small>${c || ''}</small></button>`;
    }
    const vt = `<div class="vt" role="group" aria-label="보기 방식"><button class="${S.view === 'tl' ? 'is-on' : ''}" data-act="view" data-v="tl" aria-pressed="${S.view === 'tl'}" aria-label="타임라인으로 보기">${ic('rows', 18)}<span>타임라인</span></button><button class="${S.view === 'cal' ? 'is-on' : ''}" data-act="view" data-v="cal" aria-pressed="${S.view === 'cal'}" aria-label="캘린더로 보기">${ic('calendar', 18)}<span>캘린더</span></button></div>`;
    const qb = `<button class="icb qbtn" data-act="q" aria-label="행사 검색">${ic('search')}</button>`;
    // 캘린더 보기: 달 이동과 오늘 버튼은 달력 안에 있다. 윗줄에는 보기 전환만 두고, 검색칸이 같은 줄 왼쪽에 온다(스타일에서 끌어올림).
    if (S.view === 'cal') return `<div class="dn__top"><div class="dn__r">${vt}</div></div>`;
    return `<div class="dn__top"><button class="mbtn" data-act="mp" aria-expanded="${S.mp}" aria-label="${y}년 ${m}월, 다른 달 고르기"><span class="yy">${y}년 </span>${m}월 ${ic('chevron', 18)}</button>
      <div class="dn__r">${qb}<button class="today press" data-act="today">오늘</button>${vt}</div>${S.mp ? mpHtml(y) : ''}</div>
      <div class="rbw"><button class="rbn" data-act="rb-" aria-label="이전 날짜 보기">${ic('back', 16)}</button><div class="rb" data-start="${key(from)}">${cells}</div><button class="rbn" data-act="rb+" aria-label="다음 날짜 보기">${ic('chevron', 16)}</button></div>`;
  }
  // 월 선택 풍선: 열두 달과 달마다의 행사 수
  function mpHtml(y) {
    const mcnt = {}; ALL.forEach((e) => { const mm = e.k.slice(0, 7); mcnt[mm] = (mcnt[mm] || 0) + 1; });
    return `<div class="mp" role="dialog" aria-label="월 선택"><div class="mp__y"><button class="arw" data-toast="목업에는 2026년 데이터만 들어 있어요" aria-label="이전 해">${ic('back', 16)}</button>${y}년<button class="arw" data-toast="목업에는 2026년 데이터만 들어 있어요" aria-label="다음 해">${ic('chevron', 16)}</button></div>
      <div class="mp__g">${Array.from({ length: 12 }, (_, i) => { const mk = `${y}-${pad(i + 1)}`, c = mcnt[mk] || 0; return `<button class="${mk === S.month ? 'is-on' : ''}${mk === TODAY.slice(0, 7) ? ' is-now' : ''}${c ? '' : ' is-none'}" data-month="${mk}">${i + 1}월<small>${c ? c + '건' : '–'}</small></button>`; }).join('')}</div></div>`;
  }
  function chipsHtml() {
    const pastN = filtered().filter((e) => e.k < TODAY).length;
    const c = (k, v, label) => `<button class="chip press${S[k] === v ? ' is-on' : ''}" data-set="${k}:${S[k] === v && v !== '전체' ? '전체' : v}">${label || v}</button>`;
    return `${c('topic', '전체')}${TOPIC.map((t) => c('topic', t)).join('')}<i class="sep"></i>${c('mode', '온라인')}${c('mode', '오프라인')}${c('cost', '무료')}<i class="sep"></i><button class="chip chip--new press${S.newOnly ? ' is-on' : ''}" data-act="new"><i></i>새로 올라온 행사 ${CNT.fresh}</button>${pastN && S.view !== 'cal' ? `<button class="chip chip--ghost press${S.showPast ? ' is-on' : ''}" data-act="past">${S.showPast ? '지난 행사 숨기기' : `지난 행사 ${pastN}건 보기`}</button>` : ''}`;
  }
  const newMark = (e, where) => {
    if (!e.isNew) return '';
    if (where === 'thumb') return OPT.nw === 'thumb' ? '<span class="nw-thumb">NEW</span>' : '';
    return OPT.nw === 'title' ? '<i class="nw-new">NEW</i>' : OPT.nw === 'n' ? '<i class="nw-n" aria-label="새로 올라온 행사">N</i>' : '';
  };
  const card = (e) => `
<article class="ev${e.ended ? ' is-done' : ''}">
  <a class="ev__a" href="${e.href}">
    <div class="ev__img">${thumb(e)}${newMark(e, 'thumb')}</div>
    <div class="ev__b">
      <div class="slot"><i class="${e.slot.c}">${e.slot.chip}</i>${e.slot.time ? `<span>${e.slot.time}</span>` : ''}${e.slot.extra ? `<em>${e.slot.extra}</em>` : ''}</div>
      <strong class="ev__t clamp2">${newMark(e, 'title')}${esc(e.title)}</strong>
      <p class="ev__o clamp1">${esc(e.organizer)}</p>${tags(e)}
    </div>
  </a>
  <div class="ev__act"><button class="${S.fav.has(e.id) ? 'is-on' : ''}" data-fav="${e.id}" aria-label="관심 행사에 담기">${ic('bookmark')}</button><button data-toast="링크가 복사되었어요" aria-label="링크 복사">${ic('share')}</button></div>
</article>`;
  CTX.card = card;
  function listHtml() {
    const gs = groups(), past = gs.filter((g) => g.key < TODAY), vis = S.showPast ? gs : gs.filter((g) => g.key >= TODAY);
    if (!vis.length && !past.length) return `<div class="empty"><b>조건에 맞는 행사가 없어요</b><p>검색어나 필터를 바꿔 보세요.</p><button class="press" data-act="reset">필터 초기화</button></div>`;
    let h = '';
    let pm = null;
    vis.forEach((g) => {
      const mm = g.key.slice(0, 7);
      if (pm && mm !== pm) h += `<h2 class="mdiv">${Number(mm.slice(5))}월</h2>`;
      pm = mm;
      h += `<section class="day${g.key < TODAY ? ' is-past' : ''}" id="d-${g.key}" data-key="${g.key}"><div class="day__rail"><div class="day__stick"><b>${fd(g.date)}</b><span class="${wcls(g.date)}">${DOW[g.date.getDay()]}요일</span><small>${g.items.length}건</small></div></div><div class="day__list">${g.items.map(card).join('')}</div></section>`;
    });
    return h + (vis.length ? `<p class="endnote">여기까지가 지금 등록된 행사예요.</p>` : '');
  }

  /* ---------- 캘린더 보기 (시안 08 캘린더 3분할에서) ----------
     왼쪽: 월 달력 한 달(달 이동·오늘 버튼도 달력 머리에 있다). 칸의 색이 진할수록 그날 행사가 많고, 칸 안의 숫자가 건수다.
     오른쪽: 고른 날의 행사 목록. 행사를 누르면 3분할의 셋째 칸에 여는 대신 상세 화면으로 이동한다(2026-11-16 요청).
     범례는 달력 아래에 늘 펼쳐 두지 않고 (i) 버튼을 눌렀을 때만 보여 준다(2026-11-16 요청). */
  const heat = (c) => (c === 0 ? 0 : c <= 2 ? 1 : c <= 4 ? 2 : c <= 7 ? 3 : 4);
  const md = (k) => `${Number(k.slice(5, 7))}월 ${Number(k.slice(8))}일`;
  const infoPop = () => `<div class="infp" id="infp" role="dialog" aria-label="달력 보는 법"><b>달력 보는 법</b>
    <p>칸의 색이 진할수록 그날 행사가 많아요.</p>
    <div class="infp__s" aria-hidden="true"><span>적음</span><i class="lv1"></i><i class="lv2"></i><i class="lv3"></i><i class="lv4"></i><span>많음</span></div>
    <div class="infp__n"><span>1~2건</span><span>3~4건</span><span>5~7건</span><span>8건 이상</span></div>
    <p>숫자는 그날 <em>접수를 마감하거나 열리는</em> 행사 수예요.</p>
    <button class="infp__x" data-act="info" aria-label="설명 닫기">${ic('x', 16)}</button></div>`;
  function calMonth(y, m, cnt) {
    const lead = new Date(y, m - 1, 1).getDay(), n = new Date(y, m, 0).getDate();
    let cells = '<i></i>'.repeat(lead), total = 0;
    for (let d = 1; d <= n; d++) {
      const dt = new Date(y, m - 1, d), k = key(dt), c = cnt[k] || 0; total += c;
      cells += `<button class="cc lv${heat(c)}${k < TODAY ? ' is-past' : ''}${k === TODAY ? ' is-today' : ''}${k === S.cday ? ' is-on' : ''}" ${c ? `data-cday="${k}" data-tip="${m}월 ${d}일 ${DOW[dt.getDay()]}요일 · 행사 ${c}건"` : 'disabled'} aria-pressed="${k === S.cday}" aria-label="${m}월 ${d}일 ${DOW[dt.getDay()]}요일, 행사 ${c}건${k === TODAY ? ', 오늘' : ''}"><b class="${wcls(dt)}">${d}</b><small>${c || ''}</small></button>`;
    }
    return `<div class="cm"><div class="cm__h"><button class="cm__t" data-act="mp" aria-expanded="${S.mp}" aria-label="${y}년 ${m}월, 행사 ${total}건. 다른 달 고르기">${y}년 ${m}월 ${ic('chevron', 16)}</button>
      <button class="inf" data-act="info" aria-expanded="${S.info}" aria-controls="infp" aria-label="달력의 색과 숫자가 무엇을 뜻하는지 보기">${ic('info', 20)}</button>
      <span class="cm__nav"><button class="arw" data-act="prev" aria-label="이전 달">${ic('back', 16)}</button><button class="today press" data-act="today">오늘</button><button class="arw" data-act="next" aria-label="다음 달">${ic('chevron', 16)}</button></span>${S.info ? infoPop() : ''}${S.mp ? mpHtml(y) : ''}</div>
      <div class="cm__w" aria-hidden="true">${DOW.map((w, i) => `<span class="${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}">${w}</span>`).join('')}</div><div class="cm__g">${cells}</div></div>`;
  }
  function calDay(F) {
    if (!S.cday) return `<section class="cd" id="cd" aria-live="polite"><div class="empty"><b>${Number(S.month.slice(5))}월에는 조건에 맞는 행사가 없어요</b><p>다른 달을 고르거나 오늘로 돌아가 보세요.</p><button class="press" data-act="today">오늘로 돌아가기</button></div></section>`;
    const [y, m, d] = S.cday.split('-').map(Number), dt = new Date(y, m - 1, d), past = S.cday < TODAY;
    const items = F.filter((e) => e.k === S.cday).sort((a, b) => a.en - b.en);
    const dead = items.filter((e) => e.recruit), open = items.filter((e) => !e.recruit);
    const keys = [...new Set(F.map((e) => e.k))].sort(), prev = keys.filter((k) => k < S.cday).pop(), next = keys.find((k) => k > S.cday);
    const nav = `<div class="cd__nav"><button class="arw" ${prev ? `data-cday="${prev}"` : 'disabled'} aria-label="${prev ? md(prev) + ', ' : ''}이전 행사가 있는 날">${ic('back', 16)}</button><button class="arw" ${next ? `data-cday="${next}"` : 'disabled'} aria-label="${next ? md(next) + ', ' : ''}다음 행사가 있는 날">${ic('chevron', 16)}</button></div>`;
    const sum = items.length ? [dead.length ? `접수 마감 ${dead.length}건` : '', open.length ? `${past ? '열린' : '열리는'} 행사 ${open.length}건` : ''].filter(Boolean).join(' · ') : '등록된 행사가 없어요';
    const grp = (t, a) => (a.length ? `<h3 class="cd__g">${t}</h3><div class="day__list">${a.map(card).join('')}</div>` : '');
    const body = items.length
      ? grp(past ? '이날 접수를 마감했어요' : '이날 접수를 마감해요', dead) + grp(past ? '이날 열렸어요' : S.cday === TODAY ? '오늘 열리거나 진행 중이에요' : '이날 열려요', open)
      : `<div class="empty"><b>이날은 조건에 맞는 행사가 없어요</b><p>달력에서 색이 칠해진 날짜를 눌러 보세요.</p>${next ? `<button class="press" data-cday="${next}">다음 행사가 있는 ${md(next)} 보기</button>` : prev ? `<button class="press" data-cday="${prev}">이전 행사가 있는 ${md(prev)} 보기</button>` : ''}</div>`;
    return `<section class="cd" id="cd" aria-live="polite"><div class="cd__h"><div><h2>${m}월 ${d}일 <span class="${wcls(dt)}">${DOW[dt.getDay()]}요일</span></h2><p>${sum}</p></div>${nav}</div>${body}</section>`;
  }
  function calHtml() {
    const F = filtered(), cnt = {}; F.forEach((e) => { cnt[e.k] = (cnt[e.k] || 0) + 1; });
    const [y, m] = S.month.split('-').map(Number);
    return `<div class="cv"><aside class="cv__cal" aria-label="월 달력">${calMonth(y, m, cnt)}</aside>${calDay(F)}</div>`;
  }
  // 캘린더에서 날짜 고르기. 달력은 고른 날이 있는 달을 보여 준다.
  function setCday(k, refocus) {
    S.cday = k; S.month = k.slice(0, 7); S.info = false; S.mp = false;
    paintNav(); paintList();
    if (refocus) { const el = $('.cc.is-on'); if (el) el.focus({ preventScroll: true }); }
  }
  // 달을 바꾸면 그 달에서 볼 날도 함께 고른다: 이번 달이면 오늘, 아니면 그 달의 첫 행사일. 행사가 없는 달이면 고른 날 없음.
  function setMonth(mk) {
    const keys = [...new Set(filtered().map((e) => e.k))].filter((k) => k.slice(0, 7) === mk).sort();
    S.month = mk; S.mp = false; S.info = false;
    S.cday = mk === TODAY.slice(0, 7) && keys.includes(TODAY) ? TODAY : keys.find((k) => mk !== TODAY.slice(0, 7) || k >= TODAY) || keys[0] || null;
    paintNav(); paintList();
  }
  function setView(v) {
    if (v === S.view) return;
    S.view = v; S.info = false; S.mp = false; document.documentElement.dataset.mode = v;
    if (v === 'cal') { S.cday = S.active || TODAY; S.month = S.cday.slice(0, 7); } else if (!S.cday) S.cday = TODAY;
    paintNav(); paintChips(); paintList();
    const top = $('#dn').getBoundingClientRect().top + window.scrollY;
    if (v === 'tl') { S.active = S.cday; go(S.cday); } else if (window.scrollY > top) window.scrollTo({ top });
  }
  const $ = (s) => document.querySelector(s);
  const navH = () => ($('#dn') ? $('#dn').offsetHeight : 0);
  // 띠 양끝 화살표: 더 넘길 곳이 없으면 흐리게
  function rbArrows() { const rb = $('#dn .rb'); if (!rb) return; const a = $('[data-act="rb-"]'), b = $('[data-act="rb+"]'); if (a) a.disabled = rb.scrollLeft <= 1; if (b) b.disabled = rb.scrollLeft + rb.clientWidth >= rb.scrollWidth - 1; }
  function paintNav() {
    const el = $('#dn'); if (!el) return;
    const old = el.querySelector('.rb'), keep = old ? { s: old.dataset.start, x: old.scrollLeft } : null;
    el.innerHTML = navHtml(); document.documentElement.style.setProperty('--navh', el.offsetHeight + 'px');
    const rb = el.querySelector('.rb'); if (!rb) return;
    // 다시 그려도 띠가 넘겨져 있던 자리를 지킨다. 고른 날이 화면 밖이면 그 날이 맨 왼쪽에 오게 넘긴다.
    const same = keep && keep.s === rb.dataset.start; if (same) rb.scrollLeft = keep.x;
    const on = rb.querySelector('.rc.is-on') || rb.querySelector('.rc.is-today');
    if (on) { const l = on.offsetLeft, vis = l >= rb.scrollLeft - 1 && l + on.offsetWidth <= rb.scrollLeft + rb.clientWidth + 1; if (!vis) { if (same) rb.scrollTo({ left: l, behavior: 'smooth' }); else rb.scrollLeft = l; } }
    rb.addEventListener('scroll', rbArrows, { passive: true }); rbArrows();
  }
  function paintList() { $('#list').innerHTML = S.view === 'cal' ? calHtml() : listHtml(); const p = $('.infp'), b = $('.inf'); if (p && b) p.style.setProperty('--tail', b.offsetLeft + b.offsetWidth / 2 - 6 + 'px'); } // 풍선 꼬리가 (i) 버튼을 가리키게
  function paintChips() { $('#chips').innerHTML = chipsHtml(); }
  function mainShell() {
    const nt = OPT.notice && window.EX && !S.ntOff ? window.EX.notice(OPT.notice, CTX) : '', after = nt && window.EX.noticeAfter(OPT.notice); // 말풍선 시안은 헤더 아래에 놓는다
    return (after ? '' : nt) + header() + (after ? nt : '') + `<div id="bn">${banner()}</div><div class="wrap"><div class="dn" id="dn"></div>
      <div class="ft"><label class="q">${ic('search', 18)}<input id="q" type="search" placeholder="행사명, 주최로 검색" value="${esc(S.q)}" aria-label="행사 검색"></label><div class="chips" id="chips"></div></div><div id="list"></div></div>` + SUB();
  }
  function go(k) {
    const gs = groups(); if (!gs.length) return;
    const t = gs.find((g) => g.key >= k) || gs[gs.length - 1];
    if (t.key < TODAY && !S.showPast) { S.showPast = true; paintChips(); paintList(); }
    S.active = t.key; S.month = t.key.slice(0, 7); S.mp = false; paintNav();
    const el = document.getElementById('d-' + t.key);
    if (!el) return;
    // 직접 이동하는 동안에는 스크롤 연동(spy)을 잠가, 지나가는 날짜로 선택이 바뀌지 않게 한다. 먼 거리는 바로 이동.
    const top = el.getBoundingClientRect().top + window.scrollY - navH() - 4, far = Math.abs(top - window.scrollY) > 1600;
    S.lock = true; clearTimeout(go.t); go.t = setTimeout(() => { S.lock = false; }, far ? 150 : 1000);
    window.scrollTo({ top, behavior: far ? 'auto' : 'smooth' });
  }
  function jumpMonth(mk) {
    const gs = groups().filter((g) => g.key.slice(0, 7) === mk);
    if (!gs.length) { S.mp = false; paintNav(); return toast(`${Number(mk.slice(5))}월은 목업에 데이터가 없어요. 실제로는 월별로 불러옵니다`); }
    go(mk === TODAY.slice(0, 7) ? TODAY : gs[0].key);
  }
  let ticking = false;
  function spy() {
    if (document.documentElement.dataset.view !== 'main' || ticking || S.lock) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const off = navH() + 24; let cur = null;
      for (const s of document.querySelectorAll('.day')) { if (s.getBoundingClientRect().top <= off) cur = s; else break; }
      const k = cur ? cur.dataset.key : (document.querySelector('.day') || { dataset: { key: S.active } }).dataset.key;
      if (k && k !== S.active && !S.mp) { S.active = k; S.month = k.slice(0, 7); paintNav(); }
    });
  }

  /* ---------- 상세 ---------- */
  function detail(e) {
    const i = e.recruit ? e.en : e.s;
    const same = UP.filter((x) => x.id !== e.id && x.k === e.k).slice(0, 4);
    const others = same.length ? same : UP.filter((x) => x.id !== e.id && x.topics.some((t) => e.topics.includes(t))).slice(0, 4);
    const status = e.ended ? '<b class="is-gray">종료된 행사예요</b>' : e.recruit ? `<b>마감까지 ${e.remain}</b>` : e.state === '진행 중' ? '<b class="is-blue">지금 진행 중</b>' : `<b class="is-blue">${e.label === '오늘' ? '오늘 열려요' : e.label}</b>`;
    const cta = e.ended ? `<span class="go is-off">종료된 행사예요</span>` : `<a class="go press" href="${esc(e.link)}" target="_blank" rel="noopener">신청하러 가기 ${ic('out', 18)}</a>`;
    const fav = `<button class="${S.fav.has(e.id) ? 'is-on' : ''}" data-fav="${e.id}" aria-label="관심 행사에 담기">${ic('bookmark', 18)}<span>관심</span></button>`;
    return header() + `
<div class="wrap">
  <a class="back" href="#main">${ic('back', 16)} 행사 일정</a>
  <div class="d">
    <aside class="d__l">
      <div style="position:relative" ${e.img ? `data-zoom="${esc(e.img)}"` : ''}>${thumb(e)}${e.img ? `<span class="zoomhint">${ic('zoom', 14)} 크게 보기</span>` : ''}</div>
      <div class="reg">
        <div class="reg__s"><span>${e.state} · ${e.cost}</span>${status}</div>
        ${e.recruit && !e.ended ? `<div class="pb"><i style="width:${Math.round(e.progress * 100)}%"></i></div><small><span>${fdw(e.s)} 접수 시작</span><span>${fdw(e.en)} ${ft(e.en)} 마감</span></small>` : ''}
        ${cta}
        <div class="reg__a">${fav}<button data-toast="캘린더에 추가했어요">${ic('calendar', 18)}캘린더</button><button data-toast="링크가 복사되었어요">${ic('share', 18)}공유</button></div>
        <p>신청은 주최 측 페이지에서 진행돼요.</p>
      </div>
    </aside>
    <div class="d__r">
      <div class="d__org"><i>${esc(e.initial)}</i>${esc(e.organizer)}</div>
      <h1>${esc(e.title)}</h1>${tags(e)}
      <div class="blks">
        <div class="blk"><div class="leaf"><small>${i.getMonth() + 1}월</small><b>${i.getDate()}</b></div><p><b>${i.getMonth() + 1}월 ${i.getDate()}일 ${DOW[i.getDay()]}요일${e.recruit ? ` ${ft(e.en)} 접수 마감` : e.slot.time ? ' ' + e.slot.time : ''}</b><span>${e.recruit ? '접수 기간 ' : ''}${e.range}</span></p></div>
        <div class="blk"><div class="leaf is-ic">${ic(e.mode.includes('오프라인') ? 'pin' : 'globe', 22)}</div><p><b>${e.mode.join(' · ') || '방식 미정'} 진행</b><span>${e.mode.includes('오프라인') ? '장소는 아래 행사 소개에서 확인해 주세요' : '접속 방법은 신청 후 안내돼요'}</span></p></div>
      </div>
      <h2>행사 소개</h2>
      <div class="k-prose">${e.descHtml}</div>
      ${others.length ? `<div class="more"><h2>${same.length ? '같은 날 다른 행사' : '비슷한 행사'}</h2>${others.map((x) => `<a href="${x.href}">${thumb(x)}<div><strong class="clamp2">${esc(x.title)}</strong><small>${esc(x.organizer)} · ${x.label} · ${x.cost}</small></div></a>`).join('')}</div>` : ''}
    </div>
  </div>
</div>${SUB()}
<div class="fix"><button class="${S.fav.has(e.id) ? 'is-on' : ''}" data-fav="${e.id}" aria-label="관심 행사에 담기">${ic('bookmark')}</button><button data-toast="캘린더에 추가했어요" aria-label="캘린더에 추가">${ic('calendar')}</button>${cta}</div>`;
  }

  /* ---------- 로그인 창 (시안은 login.js) ---------- */
  const LG = window.LOGIN;
  function openLogin() {
    if (!LG) return toast('로그인 창이 열려요');
    let r = $('#lg'); if (!r) { r = document.createElement('div'); r.id = 'lg'; document.body.appendChild(r); }
    r.innerHTML = LG.html(OPT.login, CTX);
    document.documentElement.dataset.lg = '1'; document.documentElement.dataset.lgv = OPT.login;
    const f = r.querySelector('.lgc'); if (f) f.focus({ preventScroll: true }); // 창 자체에 초점을 둔다(첫 버튼에 두면 눌린 것처럼 테두리가 생긴다)
  }
  function closeLogin() {
    const r = $('#lg'); if (!r || !r.firstChild) return false;
    r.innerHTML = ''; delete document.documentElement.dataset.lg; delete document.documentElement.dataset.lgv;
    const b = $('[data-act="login"]'); if (b) b.focus({ preventScroll: true });
    return true;
  }
  function loginClick(t) {
    const root = t.closest('[data-lg-root]'); if (!root) return false;
    const el = t.closest('[data-lg]');
    if (!el || !root.contains(el)) { if (t === root) closeLogin(); return true; } // 창 바깥(어두운 곳)을 누르면 닫힌다
    const act = el.dataset.lg;
    if (act === 'close') closeLogin();
    else if (act === 'more') { const box = root.querySelector('.lg-more'), open = box.hidden; box.hidden = !open; el.setAttribute('aria-expanded', open); if (open) { const f = box.querySelector('button'); if (f) f.focus({ preventScroll: true }); } }
    else if (act === 'email') { root.dataset.view = 'email'; const i = root.querySelector('.lg-email[data-pane="email"] input'); if (i) i.focus({ preventScroll: true }); }
    else if (act === 'back') { root.dataset.view = 'main'; const b = root.querySelector('.lgb--email'); if (b) b.focus({ preventScroll: true }); }
    else if (act === 'signup') { root.dataset.view = 'join'; const i = root.querySelector('.lg-email[data-pane="join"] input'); if (i) i.focus({ preventScroll: true }); } // 이메일로 가입: 같은 창 안에서 입력란으로
    else if (act.startsWith('go:')) toast(`${act.slice(3)} 화면으로 이동해요. 처음이면 바로 가입돼요`);
    return true;
  }
  document.addEventListener('submit', (ev) => { if (ev.target.matches('[data-lg-form]')) { ev.preventDefault(); toast(ev.target.dataset.lgForm === 'join' ? '목업에서는 가입되지 않아요' : '목업에서는 로그인되지 않아요'); } });

  /* ---------- 관심 행사 · 내 정보 (mypage.js) ---------- */
  // 목업에서는 관심 행사·내 정보 화면에 들어오면 로그인한 것으로 보고, 진행중 9건·종료 5건을 담아 둔 상태로 시작한다(?empty=1 이면 담은 것 없음)
  function signIn() {
    if (S.auth) return; S.auth = true;
    if (Q.get('empty') === '1' || S.fav.size) return;
    const up = UP.slice().sort((x, y) => x.keyDate - y.keyDate || x.en - y.en), rc = up.filter((e) => e.recruit), ev = up.filter((e) => !e.recruit), dn = ALL.filter((e) => e.ended).sort((x, y) => y.en - x.en);
    [0, 2, 5, 9, 14].forEach((i) => rc[i] && S.fav.add(rc[i].id)); [0, 1, 3, 6].forEach((i) => ev[i] && S.fav.add(ev[i].id)); [0, 1, 3, 5, 8].forEach((i) => dn[i] && S.fav.add(dn[i].id));
  }
  function openWithdraw() { let r = $('#mymdl'); if (!r) { r = document.createElement('div'); r.id = 'mymdl'; document.body.appendChild(r); } r.innerHTML = window.MY.withdraw(); const f = r.querySelector('.my-mdl__c'); if (f) f.focus({ preventScroll: true }); }
  function closeWithdraw() { const r = $('#mymdl'); if (r && r.firstChild) { r.innerHTML = ''; const b = $('[data-my="withdraw"]'); if (b) b.focus({ preventScroll: true }); return true; } return false; }
  function closePmenu() { const p = $('.pm.is-open'); if (!p) return false; p.classList.remove('is-open'); p.querySelector('.pm__b').setAttribute('aria-expanded', 'false'); return true; }
  function myClick(t) {
    const root = t.closest('[data-my-root]'); if (root && t === root) { closeWithdraw(); return true; } // 탈퇴 창 바깥을 누르면 닫힌다
    const sd = t.closest('[data-svday]'); if (sd) { const el = document.getElementById('svd-' + sd.dataset.svday); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.remove('is-flash'); void el.offsetWidth; el.classList.add('is-flash'); } return true; }
    const sg = t.closest('[data-stab-go]'); if (sg) { S.stab = sg.dataset.stabGo; return false; }
    const st = t.closest('[data-stab]'); if (st) { S.stab = st.dataset.stab; render(true); const b = $(`[data-stab="${S.stab}"]`); if (b) b.focus({ preventScroll: true }); return true; }
    const el = t.closest('[data-my]'); if (!el) return false;
    const act = el.dataset.my;
    if (act === 'withdraw') openWithdraw();
    else if (act === 'cancel') closeWithdraw();
    else if (act === 'confirm') { closeWithdraw(); toast('목업에서는 탈퇴되지 않아요'); }
    else if (act === 'logout') { S.auth = false; toast('로그아웃했어요'); if (location.hash === '#main' || !location.hash) render(); else location.hash = '#main'; }
    else if (act.startsWith('tab:')) { S.metab = act.slice(4); render(true); const b = $(`[data-my="${act}"]`); if (b) b.focus({ preventScroll: true }); }
    return true;
  }

  /* ---------- 소개 · 검색 결과 · 오류 화면 · 공지 띠 · 공유 안내 (extra.js) ---------- */
  const footOnly = () => (V.footOnly ? V.footOnly(CTX) : SUB());
  let lastBtn = null;
  // 공유·담기 안내. ?share= 가 있으면 기본 안내 대신 시안의 모양으로 띄운다. keep: 저절로 사라지지 않음(미리보기, 메뉴, 시트)
  function showShare(kind, anchor, keep) {
    const r = window.EX && window.EX.share(OPT.share, CTX, kind); if (!r) return false;
    let box = $('#exsh'); if (!box) { box = document.createElement('div'); box.id = 'exsh'; document.body.appendChild(box); }
    box.innerHTML = r.html; const el = box.firstElementChild;
    if (r.anchor === 'btn' && anchor) { const b = anchor.getBoundingClientRect(); el.style.left = Math.max(8, Math.min(window.innerWidth - el.offsetWidth - 8, b.left + b.width / 2 - el.offsetWidth / 2)) + 'px'; el.style.top = (b.top - el.offsetHeight - 8 < 8 ? b.bottom + 8 : b.top - el.offsetHeight - 8) + 'px'; el.classList.toggle('is-below', b.top - el.offsetHeight - 8 < 8); }
    clearTimeout(showShare.t); if (!keep && !r.keep) showShare.t = setTimeout(() => { if (box.firstElementChild === el) box.innerHTML = ''; }, 2400);
    return true;
  }
  function closeShare() { const box = $('#exsh'); if (box && box.firstChild) { box.innerHTML = ''; return true; } return false; }
  function exClick(t) {
    const sq = t.closest('[data-sq]'); if (sq) { S.q = sq.dataset.sq; if (VIEW === 'search') render(true); else location.hash = '#search'; return true; }
    const sf = t.closest('[data-sf]'); if (sf) { const [k, v] = sf.dataset.sf.split(':'); S[k] = v; render(true); return true; }
    const ex = t.closest('[data-ex]'); if (!ex) return false;
    if (ex.dataset.ex === 'ntclose') { S.ntOff = true; const n = ex.closest('.nt'); if (n) n.remove(); }
    else if (ex.dataset.ex === 'copy') { closeShare(); toast('링크가 복사되었어요'); }
    return true;
  }
  document.addEventListener('submit', (ev) => { if (ev.target.matches('[data-sr-form]')) { ev.preventDefault(); S.q = ev.target.q.value.trim() || 'AI'; if (VIEW === 'search') render(true); else location.hash = '#search'; } });

  /* ---------- 공통 동작 ---------- */
  function toast(msg) {
    if (OPT.share && window.EX) { let k = msg === '링크가 복사되었어요' ? 'share' : msg === '관심 행사에 담았어요' ? 'save' : msg === '관심 행사에서 뺐어요' ? 'unsave' : '';
      if (!k && OPT.share === 'sh4') { window.EX.msg.custom = msg; k = 'custom'; } // 정한 안(sh4)에서는 다른 안내도 같은 모양으로 띄운다
      if (k && showShare(k, lastBtn)) return; }
    let el = $('.k-toast'); if (!el) { el = document.createElement('div'); el.className = 'k-toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('is-show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('is-show'), 1800);
  }
  function render(keep) {
    let [v, id] = (location.hash || '#main').slice(1).split('/'); if (v === 'detail' && Q.get('did')) id = Q.get('did'); // 설명 페이지의 본문 폭 비교에서 다른 행사로 바꿔 볼 때
    const view = ['detail', 'saved', 'me', 'about', 'search', 'error'].includes(v) ? v : 'main', y = window.scrollY;
    VIEW = view; if (view === 'saved' || view === 'me' || Q.get('auth') === '1') signIn();
    document.documentElement.dataset.view = view; document.documentElement.dataset.mode = S.view;
    const app = document.getElementById('app');
    if (view === 'detail') { app.innerHTML = detail(ALL.find((e) => String(e.id) === String(id)) || ALL.find((e) => e.id === 3489) || UP[0]); }
    else if (view === 'about') { app.innerHTML = header() + window.EX.about(OPT.about, CTX) + footOnly(); }
    else if (view === 'search') { app.innerHTML = header() + (Q.get('nobn') === '1' ? '' : `<div id="bn">${banner()}</div>`) + window.EX.search(OPT.sr, CTX) + SUB(); }
    else if (view === 'error') { app.innerHTML = header() + window.EX.error(OPT.err, CTX) + footOnly(); }
    else if (view === 'saved') { app.innerHTML = header() + window.MY.saved(OPT.saved, CTX) + SUB(); }
    else if (view === 'me') { app.innerHTML = header() + window.MY.me(OPT.me, CTX) + SUB(); if (Q.get('open') === 'withdraw' && !render.wd) { render.wd = true; openWithdraw(); } }
    else { app.innerHTML = mainShell(); paintNav(); paintChips(); paintList(); $('#q').addEventListener('input', (ev) => { S.q = ev.target.value; paintNav(); paintList(); }); }
    window.scrollTo(0, keep ? y : 0);
    if (V.after) V.after(CTX);
    if (Q.get('open') === 'login' && !render.opened) { render.opened = true; openLogin(); }
    const shOpen = Q.get('open') || (Q.get('pv') === '1' ? 'share' : '');
    if ((shOpen === 'share' || shOpen === 'save') && OPT.share && view === 'main' && !render.sh) { render.sh = true; const k = shOpen; requestAnimationFrame(() => { const b = $(k === 'share' ? '.ev__act button:nth-child(2)' : '.ev__act [data-fav]'); if (b && (OPT.share === 'sh3' || OPT.share === 'sh9')) b.scrollIntoView({ block: 'center' }); requestAnimationFrame(() => showShare(k, b, true)); }); } // 버튼 옆에 붙는 시안은 미리보기에서 그 버튼이 보이게 내려 둔다
    if (window.parent !== window) window.parent.postMessage({ mock: true, view }, '*');
  }
  document.addEventListener('click', (ev) => {
    const t = ev.target;
    if (loginClick(t)) return;
    if (!t.closest('.pm')) closePmenu(); else if (t.closest('.pm__m a')) closePmenu();
    if (myClick(t)) return;
    lastBtn = t.closest('button, a') || lastBtn;
    if ($('#exsh') && $('#exsh').firstChild && !t.closest('.xt') && !t.closest('[data-toast], [data-fav]')) closeShare();
    if (exClick(t)) return;
    if ($('#lg') && $('#lg').firstChild && OPT.login === 'l6' && !t.closest('[data-act="login"]')) closeLogin(); // 작은 창은 바깥 아무 곳이나 누르면 닫힌다
    const lb = t.closest('.lb'); if (lb) return lb.remove();
    const bi = t.closest('.d__r .k-prose img'); if (bi && !bi.closest('a')) { const o = document.createElement('div'); o.className = 'lb'; o.innerHTML = `<img src="${bi.currentSrc || bi.src}" alt="${esc(bi.alt || '본문 그림 크게 보기')}">`; return document.body.appendChild(o); } // 본문 그림도 누르면 크게
    const z = t.closest('[data-zoom]'); if (z) { const o = document.createElement('div'); o.className = 'lb'; o.innerHTML = `<img src="${z.dataset.zoom}" alt="행사 포스터 크게 보기">`; return document.body.appendChild(o); }
    const f = t.closest('[data-fav]');
    if (f) { ev.preventDefault(); const id = Number(f.dataset.fav), on = !S.fav.has(id); on ? S.fav.add(id) : S.fav.delete(id); document.querySelectorAll(`[data-fav="${id}"]`).forEach((b) => b.classList.toggle('is-on', on)); if (VIEW === 'saved' || VIEW === 'me') render(true); return toast(on ? '관심 행사에 담았어요' : '관심 행사에서 뺐어요'); }
    // 달력 설명 풍선은 바깥을 누르면 닫힌다
    if (S.info && !t.closest('.infp, .inf')) { S.info = false; const p = $('.infp'); if (p) p.remove(); const b = $('.inf'); if (b) b.setAttribute('aria-expanded', 'false'); }
    const cd = t.closest('[data-cday]'); if (cd) return setCday(cd.dataset.cday, cd.classList.contains('cc'));
    const d = t.closest('[data-day]'); if (d) return go(d.dataset.day);
    const mo = t.closest('[data-month]'); if (mo) return S.view === 'cal' ? setMonth(mo.dataset.month) : jumpMonth(mo.dataset.month);
    const st = t.closest('[data-set]'); if (st) { const [k, v] = st.dataset.set.split(':'); S[k] = v; paintChips(); paintNav(); if (OPT.banner === 'blocks') $('#bn').innerHTML = banner(); return paintList(); }
    const a = t.closest('[data-act]');
    if (a) {
      const act = a.dataset.act, [y, m] = S.month.split('-').map(Number);
      if (act === 'mp') { S.mp = !S.mp; S.info = false; paintNav(); if (S.view === 'cal') { paintList(); const b = $('.cm__t'); if (b) b.focus({ preventScroll: true }); } return; }
      if (act === 'rb-' || act === 'rb+') { const rb = $('#dn .rb'); if (rb) rb.scrollBy({ left: (act === 'rb+' ? 1 : -1) * rb.clientWidth / 2, behavior: 'smooth' }); return; }
      if (act === 'pmenu') { const p = a.closest('.pm'), o = !p.classList.contains('is-open'); p.classList.toggle('is-open', o); a.setAttribute('aria-expanded', o); return; }
      if (act === 'login') return $('#lg') && $('#lg').firstChild ? closeLogin() : openLogin();
      if (act === 'view') return setView(a.dataset.v);
      if (act === 'info') { S.info = !S.info; S.mp = false; paintList(); const b = $('.inf'); if (b) b.focus({ preventScroll: true }); return; }
      if (act === 'prev' || act === 'next') { const dt = new Date(y, m - 1 + (act === 'next' ? 1 : -1), 1), mk = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}`; return S.view === 'cal' ? setMonth(mk) : jumpMonth(mk); }
      if (act === 'today') return S.view === 'cal' ? setCday(TODAY) : go(TODAY);
      if (act === 'past') { S.showPast = !S.showPast; paintChips(); paintNav(); paintList(); const el = $('#list'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH() - 4 }); return; }
      if (act === 'q') { const el = document.documentElement; el.dataset.q = el.dataset.q === '1' ? '0' : '1'; if (el.dataset.q === '1') $('#q').focus(); return; }
      if (act === 'new') { S.newOnly = !S.newOnly; paintChips(); paintNav(); paintList(); if (S.newOnly) { const el = $('#list'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH() - 70, behavior: 'smooth' }); } return; }
      if (act === 'reset') { Object.assign(S, { topic: '전체', mode: '전체', cost: '전체', newOnly: false, q: '' }); $('#q').value = ''; paintChips(); paintNav(); return paintList(); }
      if (act === 'theme') { const el = document.documentElement; el.dataset.theme = el.dataset.theme === 'dark' ? 'light' : 'dark'; a.innerHTML = ic(el.dataset.theme === 'dark' ? 'sun' : 'moon'); return; }
      if (act === 'bnx') { S.bannerOff = true; $('#bn').innerHTML = ''; return toast('배너를 닫았어요. 다음 방문부터는 보이지 않아요'); }
      if (V.act && V.act(act, a, CTX, { toast, go, banner: () => { $('#bn').innerHTML = banner(); if (V.after) V.after(CTX); } })) return;
      if (act === 'pk+' || act === 'pk-') { const n = REG.length || PICKS.length; S.pick = (S.pick + (act === 'pk+' ? 1 : n - 1)) % n; $('#bn').innerHTML = banner(); return; }
    }
    if (S.mp && !t.closest('.mp')) { S.mp = false; paintNav(); if (S.view === 'cal') paintList(); }
    const ts = t.closest('[data-toast]'); if (ts) { ev.preventDefault(); toast(ts.dataset.toast); }
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { if (closeShare()) return; if (closeWithdraw()) return; if (closePmenu()) return; if (closeLogin()) return; const lb = $('.lb'); if (lb) lb.remove(); if (S.mp) { S.mp = false; paintNav(); if (S.view === 'cal') { paintList(); const b = $('.cm__t'); if (b) b.focus({ preventScroll: true }); } } if (S.info) { S.info = false; paintList(); const b = $('.inf'); if (b) b.focus({ preventScroll: true }); } } });
  document.addEventListener('keydown', (ev) => {
    const c = ev.target.closest && ev.target.closest('.cc'); if (!c) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[ev.key]; if (!step) return;
    ev.preventDefault(); const [y, m, d] = c.dataset.cday.split('-').map(Number), want = key(new Date(y, m - 1, d + step));
    // 행사가 없는 날은 고를 수 없으므로, 그 방향으로 가장 가까운 행사 있는 날로 간다
    const keys = [...new Set(filtered().map((e) => e.k))].sort(), to = step > 0 ? keys.find((k) => k >= want) : keys.filter((k) => k <= want).pop();
    if (to && to !== c.dataset.cday) setCday(to, true);
  });
  // 날짜 띠를 마우스로 끌어 넘기기. (터치와 트랙패드는 브라우저가 알아서 넘긴다.) 5px 넘게 끌었으면 날짜 누르기로 치지 않는다.
  let drag = null;
  document.addEventListener('pointerdown', (ev) => {
    const rb = ev.target.closest && ev.target.closest('#dn .rb'); if (!rb || ev.pointerType !== 'mouse' || ev.button !== 0) return;
    drag = { rb, x: ev.clientX, left: rb.scrollLeft, moved: false, lastX: ev.clientX, lastT: ev.timeStamp, v: 0 };
  });
  document.addEventListener('pointermove', (ev) => {
    if (!drag) return;
    const dx = ev.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < 5) return;
    if (!drag.moved) { drag.moved = true; drag.rb.classList.add('is-drag'); } // 끄는 동안에는 칸 맞춤(스냅)을 끈다
    drag.rb.scrollLeft = drag.left - dx;
    const dt = ev.timeStamp - drag.lastT; if (dt > 0) { drag.v = (ev.clientX - drag.lastX) / dt; drag.lastX = ev.clientX; drag.lastT = ev.timeStamp; }
    ev.preventDefault();
  });
  const dragEnd = (ev) => {
    if (!drag) return; const d = drag; drag = null; if (!d.moved) return;
    // 놓으면 끌던 빠르기만큼 조금 더 가서 가장 가까운 칸에 맞춘다
    const rb = d.rb, cell = rb.querySelector('.rc').offsetWidth, still = ev.timeStamp - d.lastT > 80;
    const want = rb.scrollLeft - (still ? 0 : d.v * 220), max = rb.scrollWidth - rb.clientWidth;
    rb.scrollTo({ left: Math.max(0, Math.min(max, Math.round(want / cell) * cell)), behavior: 'smooth' });
    setTimeout(() => rb.classList.remove('is-drag'), 420);
    S.dragged = true; setTimeout(() => { S.dragged = false; }, 0);
  };
  document.addEventListener('pointerup', dragEnd); document.addEventListener('pointercancel', dragEnd);
  document.addEventListener('click', (ev) => { if (S.dragged && ev.target.closest('#dn .rb')) { ev.stopPropagation(); ev.preventDefault(); } }, true);
  document.addEventListener('dragstart', (ev) => { if (ev.target.closest && ev.target.closest('#dn .rb')) ev.preventDefault(); });
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('scrollend', () => { S.lock = false; });
  window.addEventListener('hashchange', () => render(false));
  window.__mock = { ALL, UP, S, OPT, CNT };
  render(false);
})();
