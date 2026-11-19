/* 목업 공용 도구 — 시안 12개가 같은 데이터·같은 규칙으로 그려지도록 한다. 실제 구현 코드가 아니다. */
(function () {
  // 목업이 언제 열려도 같은 화면이 나오도록 "지금"을 고정한다.
  const NOW = new Date('2026-11-13T10:00:00');
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const pad = (n) => String(n).padStart(2, '0');
  const day0 = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = (a, b) => Math.round((day0(a) - day0(b)) / 864e5);
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const MODE = ['온라인', '오프라인'];
  const COST = ['무료', '유료'];
  const KIND = ['세미나', '모임', '대회', '교육', '커뮤니티'];
  const TOPIC = ['AI', '클라우드', '블록체인', '보안', '기술일반'];

  const fd = (d) => `${d.getMonth() + 1}.${d.getDate()}`;
  const fdw = (d) => `${fd(d)}(${DOW[d.getDay()]})`;
  const ft = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  function enrich(e) {
    const s = new Date(e.start);
    const en = new Date(e.end);
    const recruit = e.type === 'RECRUIT';
    const left = diffDays(en, NOW);
    const toStart = diffDays(s, NOW);
    const st = e.useStart !== 'N';
    const et = e.useEnd !== 'N';
    let label, days, state;
    if (recruit) {
      days = left;
      label = left <= 0 ? '오늘 마감' : `마감 D-${left}`;
      state = '접수 중';
    } else if (toStart > 0) {
      days = toStart;
      label = `D-${toStart}`;
      state = '예정';
    } else {
      days = 0;
      label = '진행 중';
      state = '진행 중';
    }
    const sameDay = key(s) === key(en);
    const range = sameDay
      ? `${fdw(s)}${st ? ' ' + ft(s) : ''}${et ? ' ~ ' + ft(en) : ''}`
      : `${fdw(s)}${st ? ' ' + ft(s) : ''} ~ ${fdw(en)}${et ? ' ' + ft(en) : ''}`;
    // 목록에서 기준이 되는 날짜: 접수형은 마감일, 일시형은 시작일(이미 시작했으면 오늘)
    const keyDate = recruit ? en : toStart > 0 ? s : NOW;
    const keyTime = recruit ? (et ? ft(en) : '') : st ? ft(s) : '';
    const total = en - s || 1;
    const progress = Math.max(0, Math.min(1, (NOW - s) / total));
    const msLeft = en - NOW;
    const hLeft = Math.floor(msLeft / 36e5);
    const remain =
      msLeft <= 0 ? '종료' : hLeft < 24 ? `${hLeft}시간 ${Math.floor((msLeft % 36e5) / 6e4)}분` : `${Math.floor(hLeft / 24)}일 ${hLeft % 24}시간`;
    const text = e.descHtml
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    return Object.assign({}, e, {
      s, en, recruit, days, label, state, range, keyDate, keyTime, progress, remain, sameDay,
      urgent: days <= 1,
      soon: days <= 3,
      timeLabel: recruit ? '접수' : '일시',
      // 한 줄 요약: "11.13(금) 17:00까지 접수" / "11.18(수) 19:00 ~ 20:30"
      when: recruit ? `${fdw(en)}${et ? ' ' + ft(en) : ''}까지 접수` : range,
      whenShort: recruit ? `${keyTime || fd(en)} 마감` : `${keyTime || fd(s)} 시작`,
      mode: e.tags.filter((t) => MODE.includes(t)),
      cost: e.tags.find((t) => COST.includes(t)) || '',
      kind: e.tags.find((t) => KIND.includes(t)) || '행사',
      topics: e.tags.filter((t) => TOPIC.includes(t)),
      isNew: diffDays(NOW, new Date(e.created)) <= 3,
      excerpt: text.slice(0, 140),
      initial: (e.organizer || '?').replace(/^[\[\(（\s]+/, '').slice(0, 1),
      href: `#detail/${e.id}`,
    });
  }

  const ALL = (window.MOCK_EVENTS || []).map(enrich);
  const state = { topic: '전체', kind: '전체', mode: '전체', cost: '전체', day: key(NOW), sort: 'deadline' };

  function list(extra) {
    const f = Object.assign({}, state, extra || {});
    return ALL.filter(
      (e) =>
        (f.topic === '전체' || e.topics.includes(f.topic)) &&
        (f.kind === '전체' || e.kind === f.kind) &&
        (f.mode === '전체' || e.mode.includes(f.mode)) &&
        (f.cost === '전체' || e.cost === f.cost)
    );
  }

  function groupByDay(events) {
    const m = new Map();
    events
      .slice()
      .sort((a, b) => a.keyDate - b.keyDate || a.en - b.en)
      .forEach((e) => {
        const k = key(e.keyDate);
        if (!m.has(k)) m.set(k, { key: k, date: day0(e.keyDate), items: [] });
        m.get(k).items.push(e);
      });
    return [...m.values()];
  }

  function dayInfo(d) {
    const diff = diffDays(d, NOW);
    return {
      m: d.getMonth() + 1,
      d: d.getDate(),
      dow: DOW[d.getDay()],
      wd: d.getDay(),
      diff,
      rel: diff === 0 ? '오늘' : diff === 1 ? '내일' : diff === 2 ? '모레' : '',
      key: key(d),
      // 한국 달력 관습: 일요일 빨강, 토요일 파랑
      cls: d.getDay() === 0 ? 'is-sun' : d.getDay() === 6 ? 'is-sat' : '',
    };
  }

  function days(n, from) {
    const base = day0(from || NOW);
    return Array.from({ length: n }, (_, i) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + i));
  }

  // 썸네일: 이미지가 없거나 못 불러오면 뒤에 깔린 워드마크가 보인다.
  function thumb(e, cls) {
    return `<span class="k-thumb ${cls || ''}"><b class="k-thumb__ph">DEV.EVENT</b>${
      e.img ? `<i style="background-image:url('${esc(e.img)}')"></i>` : ''
    }</span>`;
  }

  const on = (k, v) => (state[k] === v ? ' is-on' : '');
  const chips = (k, values, cls) =>
    ['전체', ...values].map((v) => `<button class="${cls || 'chip'}${on(k, v)}" data-set="${k}:${v}">${v}</button>`).join('');

  let views = null;
  function render(keepScroll) {
    const root = document.getElementById('app');
    const h = (location.hash || '#main').slice(1);
    const [v, id] = h.split('/');
    const view = v === 'detail' ? 'detail' : 'main';
    const y = window.scrollY;
    const ev = ALL.find((e) => String(e.id) === String(id)) || K.featured;
    document.documentElement.dataset.view = view;
    root.innerHTML = view === 'detail' ? views.detail(ev) : views.main();
    if (views.after) views.after(view, ev);
    window.scrollTo(0, keepScroll ? y : 0);
    if (window.parent !== window) window.parent.postMessage({ mock: true, view }, '*');
  }

  function mount(v) {
    views = v;
    document.addEventListener('click', (ev) => {
      const t = ev.target.closest('[data-set]');
      if (t) {
        const [k, val] = t.dataset.set.split(':');
        state[k] = val;
        render(true);
        return;
      }
      const toast = ev.target.closest('[data-toast]');
      if (toast) {
        ev.preventDefault();
        showToast(toast.dataset.toast);
      }
    });
    window.addEventListener('hashchange', () => render(false));
    render(false);
  }

  function showToast(msg) {
    let el = document.querySelector('.k-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'k-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => el.classList.remove('is-show'), 1600);
  }

  const P = {
    bookmark: '<path d="M6.5 4h11v16.5l-5.5-3.8-5.5 3.8z"/>',
    share: '<path d="M12 3.5v11M7.5 8L12 3.5 16.5 8M5 13.5V20h14v-6.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    chevron: '<path d="M9 5l7 7-7 7"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>',
    out: '<path d="M8 16L18 6M9.5 6H18v8.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    pin: '<path d="M12 21s7-6.2 7-11.5a7 7 0 00-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.2 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z"/>',
    filter: '<path d="M4 7h16M7 12h10M10 17h4"/>',
    home: '<path d="M4 11l8-7 8 7v9h-5.5v-6h-5v6H4z"/>',
    user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1-4 4-5.5 7.5-5.5s6.500 1.500 7.500 5.500"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    mail: '<rect x="3.500" y="5.500" width="17" height="13" rx="3"/><path d="M4.500 8l7.500 5 7.500-5"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1.500"/><rect x="13" y="4" width="7" height="7" rx="1.500"/><rect x="4" y="13" width="7" height="7" rx="1.500"/><rect x="13" y="13" width="7" height="7" rx="1.500"/>',
    list: '<path d="M8.500 6.500H20M8.500 12H20M8.500 17.500H20M4.500 6.500h.01M4.500 12h.01M4.500 17.500h.01"/>',
    globe: '<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c2.500 2.500 3.500 5.500 3.500 8.500s-1 6-3.500 8.500c-2.500-2.500-3.500-5.500-3.500-8.500s1-6 3.500-8.500z"/>',
  };
  const ic = (n, s) =>
    `<svg class="ic" width="${s || 20}" height="${s || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

  const K = {
    ic,
    NOW, DOW, ALL, state, esc, pad, fd, fdw, ft, key, day0, diffDays, list, groupByDay, dayInfo, days, thumb, on, chips, mount, render,
    TOPIC, KIND, MODE, COST,
    byId: (id) => ALL.find((e) => String(e.id) === String(id)),
    featured: null,
    today: () => ALL.filter((e) => e.days <= 0),
    count: (fn) => ALL.filter(fn).length,
    todayText: `${NOW.getMonth() + 1}월 ${NOW.getDate()}일 ${DOW[NOW.getDay()]}요일`,
    related: (e, n) => ALL.filter((x) => x.id !== e.id && x.topics.some((t) => e.topics.includes(t))).slice(0, n || 4),
  };
  K.featured = K.byId(3489) || ALL[0];
  window.K = K;
})();
