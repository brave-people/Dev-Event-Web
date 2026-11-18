/* 배너·구독/푸터 시안 모음. app.js 가 ?banner=… ?foot=… 값에 따라 여기 함수를 불러 그린다.
   c(ctx)에는 app.js 의 도구(날짜 포맷, 아이콘, 썸네일, 행사 목록, 집계 값)가 들어 있다. */
(function () {
  const L = {
    sub: 'https://github.com/brave-people/Dev-Event-Subscribe', th: 'https://www.threads.com/@dev.event.official', ig: 'https://www.instagram.com/dev.event.official/',
    gh: 'https://github.com/brave-people/Dev-Event', whale: 'https://store.whale.naver.com/detail/dfhagfnmecmkhdoeggeokfmmkbpiahek',
  };
  const ext = 'target="_blank" rel="noopener"';
  const xBtn = (c, dark) => `<button class="vb__x${dark ? ' is-dark' : ''}" data-act="bnx" aria-label="배너 닫기">${c.ic('x', 18)}</button>`;
  const within = (c, n) => c.UP.filter((e) => c.diffDays(e.keyDate, c.NOW) <= n);
  const deadlines = (c) => c.UP.filter((e) => e.recruit && e.en > c.NOW).sort((a, b) => a.en - b.en);
  const dayWord = (c, d) => { const n = c.diffDays(d, c.NOW); return n <= 0 ? '오늘' : n === 1 ? '내일' : c.fdw(d); };

  /* ================= 스티커 도구 ================= */
  const SK = window.STICKERS || { art: () => '', DEFS: '' };
  // [그림 이름, 붙는 쪽(l/r), 가로, 세로, 기울기, 크기, 모바일 위치([가로, 세로, 크기] 또는 null=숨김), 누를 때 동작, 덧붙일 클래스]
  const stkGroup = (c, list) => `<div class="stk-g">${list.map(([name, side, x, y, r, s, mob, fn, cls]) =>
    `<span class="stk ${side}${mob ? '' : ' pc'}${fn ? ' fn' : ''}${cls ? ' ' + cls : ''}" ${fn || 'aria-hidden="true"'} style="--x:${x}px;--y:${y}px;--r:${r}deg;--s:${s}${mob ? `;--mx:${mob[0]}px;--my:${mob[1]}px;--ms:${mob[2]}` : ''}">${SK.art(name, c)}</span>`).join('')}</div>`;

  // 홀1의 오른쪽 위 자리(처음엔 마이크). ?slot= 으로 후보를 바꿔 볼 수 있다. [그림, x, y, 기울기, 크기]
  const SLOTS = { gopher: ['gopher', 180, -8, -9, 0.88], bug: ['holo:bug', 180, -6, -12, 0.86], db: ['holo:db', 184, -4, -9, 0.9], chip: ['holo:chip', 176, -4, -10, 0.86], graph: ['graph', 172, -2, -9, 0.82], prompt: ['prompt', 174, 8, -9, 0.92],
    brace: ['holo:brace', 178, 0, -9, 0.88], key: ['key', 180, 2, -10, 0.92], k8s: ['lg:k8s:hex:w', 178, -8, -9, 0.84], rust: ['lg:rust:disc:w', 176, -2, -9, 0.84] };
  const SLOT_DEFAULT = 'prompt'; // 2026-11-16 결정: 프롬프트
  const slot = () => { const k = new URLSearchParams(location.search).get('slot'), [n, x, y, r, sc] = SLOTS[k] || SLOTS[SLOT_DEFAULT]; return [n, 'r', x, y, r, sc, null]; };

  // 육각 벌집: 양옆에 여덟 장씩 맞붙이고 한 장씩은 떼어 놓는다. 꼭짓점이 위인 육각은 홀수 줄을 반 칸 밀어야 맞물린다
  const comb = (c, L, sl, R, sr) => {
    const cell = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1]], S = 0.9, W = 80 * S, HH = 92 * S, G = 5;
    const pos = ([r, q]) => [Math.round(-14 + q * (W + G) + (r % 2 ? (W + G) / 2 : 0) - (80 - W) / 2), Math.round(-20 + r * (HH * 0.75 + G * 0.87) - (92 - HH) / 2)];
    const mob = [[-36, -27, 0.6], null, null, [-10, 17, 0.6], null, null, [-36, 62, 0.6], null];
    const side = (arr, sd) => arr.map((n, i) => { const [x, y] = pos(cell[i]); return [n, sd, x, y, 0, S, mob[i], '', cell[i][1] === 2 && cell[i][0] === 1 ? 'in' : '']; });
    return `<section class="vb eb eb-stk eb-stk5">${SK.DEFS}${stkGroup(c, [...side(L, 'l'), [sl, 'l', 268, 96, 14, 0.8, null, '', 'in'], ...side(R, 'r'), [sr, 'r', 268, 96, -12, 0.8, null, '', 'in']])}<div class="eb__c">${SLOGAN}</div></section>`;
  };

  /* ================= 배너 ================= */
  // 등록된 배너가 없을 때 쓰는 문구. 지금 서비스의 슬로건 그대로다.
  const SLOGAN = '<h2>개발자 행사는<br>모두 <em>Dev Event 웹</em>에서</h2><p>진행 중인 행사부터 종료된 행사까지, 놓치지 마세요!</p>';
  const banners = {
    /* ----- 등록된 배너가 없을 때(F의 슬로건은 그대로, 물결 대신 다른 바탕) ----- */
    // 가. 단색 면
    solid: () => `<section class="vb eb eb-solid"><div class="eb__c">${SLOGAN}</div></section>`,
    // 나. 포스터 벽: 실제 행사 포스터를 깔고 어둡게 덮는다
    wall: (c) => {
      const im = c.UP.filter((e) => e.img), t = Array.from({ length: 42 }, (_, i) => im[i % im.length]);
      return `<section class="vb eb eb-wall"><div class="ew-g" aria-hidden="true">${t.map((e) => `<i style="background-image:url('${c.esc(e.img)}')"></i>`).join('')}</div><div class="eb__c">${SLOGAN}</div></section>`;
    },
    // 다. 행사 막대: 앞으로 6주, 날짜마다 행사 수만큼 칸을 쌓는다
    bars: (c) => {
      const cnt = {}; c.UP.forEach((e) => { cnt[e.k] = (cnt[e.k] || 0) + 1; });
      const cols = Array.from({ length: 42 }, (_, i) => { const d = new Date(c.NOW.getFullYear(), c.NOW.getMonth(), c.NOW.getDate() + i); return `<i class="${i ? '' : 'is-today'}" style="--n:${Math.min(cnt[c.key(d)] || 0, 14)}"></i>`; });
      return `<section class="vb eb eb-bars"><div class="eg-g" aria-hidden="true">${cols.join('')}</div><div class="eb__c">${SLOGAN}</div><span class="eg-cap">한 칸이 행사 한 건 · 오늘부터 6주</span></section>`;
    },
    // 라. 행사 이름: 실제 행사 제목을 큰 글자로 깔아 바탕으로 쓴다
    names: (c) => {
      const t = c.UP.map((e) => c.esc(e.title.split(' - ')[0].slice(0, 26)));
      const row = (o) => `<p>${Array.from({ length: 9 }, (_, i) => t[(o + i) % t.length]).join('<b>/</b>')}</p>`;
      return `<section class="vb eb eb-names"><div class="en-g" aria-hidden="true">${[0, 9, 18, 27].map(row).join('')}</div><div class="eb__c">${SLOGAN}</div></section>`;
    },
    // 마. 흰 바탕에 글자만
    paper: () => `<section class="vb eb eb-paper"><div class="eb__c">${SLOGAN}</div></section>`,
    // 바. 기본 배너: 등록 배너와 같은 틀(왼쪽 글, 오른쪽 내용)에 서비스 자신을 넣는다
    self: (c) => `<section class="vb eb eb-self"><div class="es-in"><div class="es-t">${SLOGAN}</div>
      <ul><li><button data-act="today"><b>${c.CNT.today}</b>오늘 마감</button></li><li><button data-act="today"><b>${c.CNT.week}</b>이번 주 열리는 행사</button></li><li><button data-act="new"><b>${c.CNT.fresh}</b>새로 올라온 행사</button></li></ul></div></section>`,


    /* ----- 등록된 배너가 없을 때, 두 번째 묶음(2026-11-16): 움직임과 재질이 있는 바탕 ----- */
    // 사. 무대 조명: 어두운 무대 위로 조명 다섯 줄기가 천천히 흔들린다
    stage: () => `<section class="vb eb eb-stage"><div class="sg-b" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div class="eb__c">${SLOGAN}</div></section>`,
    // 아. 안내판: 공항 출발 안내판처럼 글자판이 넘어가며 슬로건과 오늘의 숫자를 번갈아 보여 준다
    board: (c) => {
      const row = (t) => { const n = 16 - [...t].length, l = Math.floor(n / 2); return ' '.repeat(Math.max(0, l)) + t + ' '.repeat(Math.max(0, n - l)); };
      const m = [['개발자 행사는', '모두 DEV EVENT 웹에서'], [`오늘 마감 ${c.CNT.today}건`, `이번 주 행사 ${c.CNT.week}건`], [`새로 올라온 행사 ${c.CNT.fresh}건`, '놓치지 마세요']].map((x) => x.map(row));
      const tiles = (t) => `<div class="bd-r">${[...t].map((ch) => `<i>${ch.trim()}</i>`).join('')}</div>`;
      return `<section class="vb eb eb-board" aria-label="개발자 행사는 모두 Dev Event 웹에서"><div class="bd" aria-hidden="true">
        <div class="bd-h"><span>DEV.EVENT</span><span>행사 안내</span><b>${c.pad(c.NOW.getMonth() + 1)}.${c.pad(c.NOW.getDate())} ${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][c.NOW.getDay()]}</b></div>
        <div class="bd-g" data-m='${JSON.stringify(m)}'>${tiles(m[0][0])}${tiles(m[0][1])}</div></div></section>`;
    },
    // 자. 객석: 무대에서 올려다본 객석. 자리가 하나둘 켜진다
    seats: () => {
      let sd = 11; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      const cx = 800, cy = 372, out = [];
      for (let r = 180; r < 1000; r += 25) {
        const n = Math.floor((Math.PI * r) / 14.5);
        for (let i = 0; i <= n; i++) {
          const a = Math.PI + (Math.PI * i) / n, x = cx + r * Math.cos(a), y = cy + r * Math.sin(a), deg = (a * 180) / Math.PI;
          if (y < -6 || y > 206 || x < -6 || x > 1606 || Math.abs(Math.abs(deg - 270) - 17) < 1.3 || Math.abs(Math.abs(deg - 270) - 44) < 1) continue;
          const k = rnd(), cl = k < 0.045 ? 'a tw' : k < 0.12 ? 'b' : k < 0.15 ? 'c tw' : '';
          out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6"${cl ? ` class="${cl}"` : ''}${cl.includes('tw') ? ` style="animation-delay:-${(rnd() * 7).toFixed(1)}s"` : ''}/>`);
        }
      }
      return `<section class="vb eb eb-seats"><svg class="se-g" viewBox="0 0 1600 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${out.join('')}</svg><div class="eb__c">${SLOGAN}</div></section>`;
    },
    // 차. 글자 그림: 기호로 그린 무늬가 흐른다
    ascii: () => `<section class="vb eb eb-ascii"><pre class="as-p" aria-hidden="true"></pre><div class="eb__c">${SLOGAN}</div></section>`,
    // 카. 키캡: 슬로건 속 DEV EVENT를 키보드 자판으로. 차례로 눌린다
    keys: () => {
      const k = (t, cls) => [...t].map((ch, i) => `<kbd class="${cls}" style="--i:${i + (cls ? 0 : 3)}">${ch}</kbd>`).join('');
      return `<section class="vb eb eb-keys"><div class="eb__c"><h2>개발자 행사는 모두<br><span class="ky" aria-label="Dev Event">${k('DEV', 'is-b')}<i></i>${k('EVENT', '')}</span> 웹에서</h2><p>진행 중인 행사부터 종료된 행사까지, 놓치지 마세요!</p></div></section>`;
    },
    // 타. 스티커: 노트북 덮개에 붙인 스티커처럼
    sticker: () => {
      const st = [
        ['l', 30, 20, -10, 'sk-code', '&lt;/&gt;', ''], ['l', 20, 124, -5, 'sk-404', '404', ''], ['l', 118, 30, 7, 'sk-meet', '밋업', ''], ['l', 106, 120, 5, 'sk-hello', 'Hello, World!', ''],
        ['l', 232, 70, -6, 'sk-hack', '해커톤', 'in'], ['r', 26, 26, 5, 'sk-git', '$ git push', ''], ['r', 30, 126, -4, 'sk-conf', '컨퍼런스', ''], ['r', 158, 84, -9, 'sk-dday', 'D-3', ''],
        ['r', 150, 20, 9, 'sk-semi', '세미나', 'in'], ['r', 246, 128, 4, 'sk-lgtm', 'LGTM', 'in'], ['r', 262, 38, -12, 'sk-free', '무료', 'in'],
      ];
      return `<section class="vb eb eb-sticker"><div class="sk-g" aria-hidden="true">${st.map(([side, x, y, r, cls, t, x2], i) => `<span class="sk ${cls} ${x2}" style="${side === 'l' ? 'left' : 'right'}:${x}px;top:${y}px;--r:${r}deg;--d:${i * 60}ms">${t}</span>`).join('')}</div><div class="eb__c">${SLOGAN}</div></section>`;
    },
    // 파. 입장권: 등록 배너와 같은 틀(왼쪽 글, 오른쪽 그림). 그림 자리에 입장권 한 장
    ticket: (c) => `<section class="vb eb-ticket"><div class="tk-in"><div class="tk-t">${SLOGAN}</div>
      <div class="tk" aria-hidden="true"><div class="tk-m"><small>ADMIT ALL · 누구나 입장</small><strong>DEV EVENT</strong>
        <dl><div><dt>MONTH</dt><dd>${c.NOW.getFullYear()}.${c.pad(c.NOW.getMonth() + 1)}</dd></div><div><dt>EVENTS</dt><dd>${c.UP.length}건</dd></div><div><dt>SEAT</dt><dd>자유석</dd></div></dl></div>
        <div class="tk-s"><i></i><span>NO. ${String(c.UP.length).padStart(6, '0')}</span></div></div></div></section>`,
    // 하. 빛 번짐: 파랑·하늘·보라 빛이 천천히 섞인다
    aurora: () => `<section class="vb eb eb-aurora"><div class="au" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="eb__c">${SLOGAN}</div></section>`,

    /* ----- 세 번째 묶음(2026-11-16): 실제 행사 사이트의 맨 위 화면에서 본 처리를 가져온 것 ----- */
    // 거. 속도선: 길이가 다른 가로 띠가 좌우로 흐른다 (FEConf 2026에서 본 가로 속도선)
    speed: () => {
      let sd = 5; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      const C = ['#0a2a9e', '#2b6bff', '#57a6ff', '#9ad4ff', '#06134f', '#0a2a9e', '#ffffff'];
      const bars = Array.from({ length: 18 }, () => { const h = 8 + Math.floor(rnd() * 34), c = C[Math.floor(rnd() * C.length)];
        return `<i style="top:${Math.floor(rnd() * 96)}%;height:${h}px;left:${Math.floor(rnd() * 100 - 20)}%;width:${Math.floor(26 + rnd() * 56)}%;--c:${c};--t:${(7 + rnd() * 13).toFixed(1)}s;--m:${((rnd() > 0.5 ? 1 : -1) * (10 + rnd() * 24)).toFixed(0)}%;opacity:${c === '#ffffff' ? 0.45 : 0.92}"></i>`; });
      return `<section class="vb eb eb-speed"><div class="sp-g" aria-hidden="true">${bars.join('')}</div><div class="eb__c">${SLOGAN}</div></section>`;
    },
    // 너. 방사 조각: 슬로건 뒤에서 조각이 사방으로 뻗는다 (인프콘 2024에서 본 방사형 조각)
    burst: () => {
      let sd = 23; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      const C = ['#0043ff', '#0043ff', '#7aa2ff', '#c4d6ff', '#c4d6ff', '#ffd84d'];
      const pt = (r, t) => `${(800 + r * Math.cos(t)).toFixed(1)},${(100 + r * Math.sin(t)).toFixed(1)}`;
      const sh = Array.from({ length: 52 }, (_, i) => {
        const a = (i % 2 ? 0 : Math.PI) + (rnd() + rnd() - 1) * 0.62, w = ((0.5 + rnd() * 2.2) * Math.PI) / 180;
        const base = 1 / Math.hypot(Math.cos(a) / 390, Math.sin(a) / 104), r1 = base + rnd() * 170, r2 = r1 + 110 + rnd() * 520;
        return `<polygon points="${pt(r1, a - w * 0.4)} ${pt(r2, a - w)} ${pt(r2, a + w)} ${pt(r1, a + w * 0.4)}" fill="${C[Math.floor(rnd() * C.length)]}" style="--dx:${(Math.cos(a) * 16).toFixed(1)}px;--dy:${(Math.sin(a) * 16).toFixed(1)}px;--t:${(3 + rnd() * 4).toFixed(1)}s"/>`;
      });
      return `<section class="vb eb eb-burst"><svg class="bu-g" viewBox="0 0 1600 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sh.join('')}</svg><div class="eb__c">${SLOGAN}</div></section>`;
    },
    // 더. 픽셀 블록: 채운 칸, 체크 칸, 점 칸이 깜빡인다 (Next.js Conf에서 본 파란 픽셀·망점 블록)
    pixel: () => {
      let sd = 41; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      const out = [], cell = (cx, cy, m) => { const k = rnd(), cl = k < 0.4 ? 's' : k < 0.74 ? 'c' : 'd'; out.push(`<i class="${cl}${rnd() < 0.34 ? ' bl' : ''}${m ? ' m' : ''}" style="left:${cx * 25}px;top:${cy * 25}px;animation-delay:-${(rnd() * 8).toFixed(1)}s"></i>`); };
      for (let cx = 0; cx < 64; cx++) for (let cy = 0; cy < 8; cy++) {
        const d = Math.abs(cx - 31.5) / 32;
        if (d >= 0.36) { if (rnd() < Math.pow((d - 0.36) / 0.64, 1.25) * 0.66) cell(cx, cy, false); } else if ((cy === 0 || cy === 7) && d < 0.24 && rnd() < 0.5) cell(cx, cy, true);
      }
      return `<section class="vb eb eb-pixel"><div class="px-g" aria-hidden="true">${out.join('')}</div><div class="eb__c">${SLOGAN}</div></section>`;
    },
    // 러. 선 그림: 검정 바탕에 흰 선으로 그린 시계·고리·눈금 (if(kakao)에서 본 선 장식). 시계는 지금 시각, 눈금은 날짜별 행사 수
    lines: (c) => {
      const cnt = {}; c.UP.forEach((e) => { cnt[e.k] = (cnt[e.k] || 0) + 1; });
      const N = c.NOW, ha = ((N.getHours() % 12) + N.getMinutes() / 60) * 30, ma = N.getMinutes() * 6;
      const ticks = Array.from({ length: 16 }, (_, i) => { const d = new Date(N.getFullYear(), N.getMonth(), N.getDate() + i), n = cnt[c.key(d)] || 0, x = 10 + i * 17, len = 20 + Math.min(n, 10) * 9;
        return `<line x1="${x}" y1="${132 - len}" x2="${x}" y2="132" class="${i === 0 ? 't' : d.getDay() === 0 ? 'su' : d.getDay() === 6 ? 'sa' : ''}"/><text x="${x}" y="146">${d.getDate()}</text>`; });
      return `<section class="vb eb eb-lines"><svg class="ln-l" viewBox="0 0 300 200" aria-hidden="true">
        <circle class="ring" cx="84" cy="100" r="64"/><line class="hd" x1="84" y1="100" x2="84" y2="64" transform="rotate(${ha.toFixed(1)} 84 100)"/><line class="hd" x1="84" y1="100" x2="84" y2="46" transform="rotate(${ma} 84 100)"/><line class="sec" x1="84" y1="110" x2="84" y2="42"/>
        <g class="el">${[0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="230" cy="${74 + i * 9}" rx="56" ry="13"${i === 2 ? ' class="y"' : i === 4 ? ' class="g"' : ''} style="--d:${i * -0.5}s"/>`).join('')}</g></svg>
        <svg class="ln-r" viewBox="0 0 280 200" aria-hidden="true">${ticks.join('')}<text class="cap" x="10" y="166">DAILY EVENTS · ${c.pad(N.getMonth() + 1)}.${c.pad(N.getDate())} →</text></svg>
        <div class="eb__c">${SLOGAN}</div></section>`;
    },

    // 머. 사선 빛: 어두운 바탕에 끝이 번지는 굵은 사선 줄 (Raycast에서 본 사선 줄무늬)
    slash: () => {
      const B = [[-262, 30, 190, -24, 9], [-158, 44, 250, 22, 12], [-54, 52, 280, -10, 10], [52, 50, 270, 28, 13], [156, 40, 230, -26, 11], [258, 28, 180, 12, 9]];
      const L = [[-420, 3, 300, 0, 14], [-340, 2, 240, 30, 10], [352, 3, 300, -10, 12], [430, 2, 230, 24, 15]];
      const mk = (a, cls) => a.map(([x, w, h, o, t]) => `<i class="${cls}" style="--x:${x}px;--w:${w}px;--h:${h}px;--o:${o}px;--t:${t}s"></i>`).join('');
      return `<section class="vb eb eb-slash"><div class="sl-g" aria-hidden="true">${mk(B, 'b')}${mk(L, 'l')}</div><div class="eb__c">${SLOGAN}</div></section>`;
    },

    /* ----- 스티커 묶음(2026-11-16): '타. 스티커'를 발전시킨 것. 그림은 stickers.js ----- */
    // 스1. 칼선 스티커: 글자 배지 대신 그림 스티커. 흰 테두리가 그림 모양을 따라간다. 끌어서 옮길 수 있다
    stk1: (c) => `<section class="vb eb eb-stk eb-stk1">${SK.DEFS}${stkGroup(c, [
      ['hello', 'l', 14, 10, -9, 1, [-18, -14, 0.56]], ['pizza', 'l', 30, 112, -16, 0.84, [-10, 98, 0.5]], ['cal', 'l', 144, 98, 7, 0.92, null, 'data-act="today" title="오늘 행사로 가기"'],
      ['laptop', 'l', 170, 2, 5, 0.86, null], ['ring', 'l', 262, 96, -12, 0.82, null, '', 'in'], ['bolt', 'l', 296, 22, 14, 0.62, null, '', 'in'],
      ['ticket', 'r', 16, 12, 8, 1, [-34, -8, 0.56]], ['free', 'r', 20, 100, -7, 0.9, [-12, 92, 0.56], 'data-set="cost:무료" title="무료 행사만 보기"'], ['term', 'r', 110, 110, -5, 0.86, null],
      ['mic', 'r', 170, -4, 13, 0.8, null], ['smile', 'r', 262, 104, 9, 0.72, null, '', 'in'], ['rsvp', 'r', 236, 26, -10, 0.84, null, '', 'in'],
    ])}<div class="eb__c"><span class="stk s1-seal fn" data-act="today" title="오늘 마감하는 행사 보기" style="--r:0deg;--s:.74">${SK.art('seal', c)}</span>${SLOGAN}</div></section>`,
    // 스2. 노트북 덮개: 어두운 알루미늄 덮개에 빽빽하게 붙인 스티커. 가장자리 스티커는 띠 밖으로 잘린다
    stk2: (c) => `<section class="vb eb eb-stk eb-stk2">${SK.DEFS}${stkGroup(c, [
      ['term', 'l', -30, 6, -9, 1, [-58, -14, 0.56]], ['pizza', 'l', 88, -18, 16, 0.9, null], ['hello', 'l', 20, 104, 6, 1, [-30, 96, 0.54]], ['code', 'l', 158, 58, -6, 0.86, null],
      ['bolt', 'l', 238, -8, 14, 0.74, null], ['cal', 'l', 232, 106, -7, 0.9, null, 'data-act="today" title="오늘 행사로 가기"'], ['컨퍼런스', 'l', 318, 52, 5, 0.86, null, '', 'in'], ['key', 'l', 136, 150, 9, 0.7, null],
      ['logo', 'r', -26, 18, 8, 1, [-64, -4, 0.56]], ['mic', 'r', 110, -16, -12, 0.92, null], ['ticket', 'r', 6, 96, -6, 1, [-40, 104, 0.54]], ['free', 'r', 150, 84, 9, 0.9, null, 'data-set="cost:무료" title="무료 행사만 보기"'],
      ['coffee', 'r', 236, 0, 7, 0.78, null], ['e404', 'r', 226, 132, -5, 0.84, null], ['해커톤', 'r', 306, 76, -8, 0.86, null, '', 'in'], ['dday', 'r', 96, 150, -10, 0.7, null],
    ])}<div class="eb__c">${SLOGAN}</div></section>`,
    // 스3. 스티커 판: 왼쪽 슬로건, 오른쪽에 스티커 판 한 장. 한 칸은 떼어 내 슬로건 옆에 붙였다 (등록 배너와 같은 '왼쪽 글, 오른쪽 그림' 틀)
    stk3: (c) => `<section class="vb eb-stk eb-stk3">${SK.DEFS}<div class="s3-in"><div class="s3-t">${SLOGAN}<span class="stk s3-peel" aria-hidden="true" style="--r:9deg;--s:.8">${SK.art('cal', c)}</span></div>
      <div class="s3-sheet" aria-hidden="true"><div class="s3-h"><b>DEV.EVENT</b><span>STICKER PACK · 스티커 12종</span><i></i></div>
        <div class="s3-g">${['hello', 'ticket', 'laptop', 'free', 'pizza', 'cal', 'term', 'mic', 'bolt', 'dday', 'coffee', 'key'].map((n) => `<span class="${n === 'cal' ? 'is-gone' : ''}">${SK.art(n, c)}</span>`).join('')}</div></div></div></section>`,
    // 스4. 슬로건이 스티커: 슬로건의 낱말 하나하나가 딱지다
    stk4: (c) => `<section class="vb eb eb-stk eb-stk4">${SK.DEFS}${stkGroup(c, [
      ['laptop', 'l', 40, 20, -9, 0.9, [-26, -16, 0.5]], ['pizza', 'l', 150, 104, 12, 0.8, null], ['ticket', 'l', 14, 118, 6, 0.86, [-40, 108, 0.5]], ['bolt', 'l', 222, 14, 10, 0.66, null, '', 'in'],
      ['mic', 'r', 54, 8, 12, 0.84, [-10, -20, 0.5]], ['free', 'r', 140, 98, -8, 0.86, null, 'data-set="cost:무료" title="무료 행사만 보기"'], ['term', 'r', 0, 112, -5, 0.84, [-52, 108, 0.5]], ['cal', 'r', 228, 14, 8, 0.8, null, 'data-act="today" title="오늘 행사로 가기"', 'in'],
    ])}<div class="eb__c"><h2 class="s4-h" aria-label="개발자 행사는 모두 Dev Event 웹에서"><span class="w w1">개발자</span><span class="w w2">행사는</span><span class="w w3">모두</span><br><span class="w w4">Dev Event</span><span class="w w5">웹에서</span></h2></div></section>`,

    // 스5. 홀로그램: 어두운 바탕에 무지개빛이 흐르는 홀로그램 스티커를 섞었다
    stk5: (c) => `<section class="vb eb eb-stk eb-stk5">${SK.DEFS}${stkGroup(c, [
      ['holo:logo', 'l', 10, 16, -7, 1, [-44, -8, 0.56]], ['laptop', 'l', 28, 104, 8, 0.9, [-22, 100, 0.52]], ['holo:free', 'l', 158, 74, -10, 0.92, null, 'data-set="cost:무료" title="무료 행사만 보기"'],
      ['cal', 'l', 244, 4, 7, 0.84, null, 'data-act="today" title="오늘 행사로 가기"'], ['holo:bolt', 'l', 268, 110, 12, 0.7, null, '', 'in'],
      ['holo:ticket', 'r', 14, 18, 8, 1, [-40, -8, 0.56]], ['term', 'r', 24, 108, -5, 0.9, [-46, 104, 0.52]], ['holo:dday', 'r', 170, 82, 9, 0.9, null], ['mic', 'r', 172, -6, -11, 0.8, null],
      ['holo:code', 'r', 262, 20, -8, 0.78, null, '', 'in'], ['hello', 'r', 268, 112, 5, 0.7, null, '', 'in'],
    ])}<div class="eb__c">${SLOGAN}</div></section>`,

    /* ----- 홀로그램 묶음(2026-11-16): 스5로 정한 뒤, 행사와 거리가 먼 딱지(D-3·입장권·무료·일력)를 빼고 기술 로고·개발 소재로 바꾼 것.
       로고는 공식 문서에서 허락 없이 쓸 수 있다고 확인한 것만 쓴다(Python은 공식 색 그대로, TypeScript·Git은 공식 색이나 단색, JS·Android·Tux는 변형 가능). 홀2만 예외로 18종을 다 넣었다. ----- */
    // 홀1. 로고 섞기 (2026-11-16 결정): 스5의 배치 그대로, 뺀 자리에 로고 스티커를 넣었다. 마이크는 개발자 행사와 맞지 않는다는 의견으로 뺐다. 그 자리는 slot() — .kt 확장자 딱지와 LGTM 꼬리표는 거절, 후보 열 가지 가운데 프롬프트로 결정
    holo1: (c) => `<section class="vb eb eb-stk eb-stk5">${SK.DEFS}${stkGroup(c, [
      ['holo:logo', 'l', 10, 16, -7, 1, [-44, -8, 0.56]], ['laptop', 'l', 28, 104, 8, 0.9, [-22, 100, 0.52]], ['lg:python:disc:w', 'l', 156, 72, -10, 0.94, null],
      ['lg:js:hex:h', 'l', 248, 2, 9, 0.8, null], ['lg:android:disc:k', 'l', 266, 106, 12, 0.76, null, '', 'in'],
      ['lg:linux:hex:h', 'r', 22, 6, 8, 0.98, [-18, -22, 0.56]], ['term', 'r', 24, 108, -5, 0.9, [-46, 104, 0.52]], ['lg:ts:disc:h', 'r', 170, 82, 9, 0.9, null], slot(),
      ['holo:code', 'r', 262, 20, -8, 0.78, null, '', 'in'], ['lg:git:disc:h', 'r', 268, 108, 5, 0.72, null, '', 'in'],
    ])}<div class="eb__c">${SLOGAN}</div></section>`,
    // 홀2. 육각 벌집(로고 18종): 개발자 행사에서 나눠 주는 육각 스티커를 벌집으로 맞붙였다. 사용 조건을 따지지 않고 넣고 싶은 로고를 다 넣은 판
    holo2: (c) => comb(c, ['lg:python:hex:h', 'lg:js:hex:k', 'lg:ts:hex:h', 'lg:react:hex:k', 'lg:kotlin:hex:h', 'lg:spring:hex:w', 'lg:go:hex:h', 'lg:rust:hex:k'], 'lg:git:hex:h',
      ['lg:docker:hex:h', 'lg:k8s:hex:k', 'lg:swift:hex:h', 'lg:flutter:hex:w', 'lg:vue:hex:h', 'lg:linux:hex:k', 'lg:pytorch:hex:h', 'lg:android:hex:k'], 'lg:github:hex:h'),
    // 홀6. 육각 벌집(조건에 맞춘 판): 같은 벌집인데, 허락 없이 쓸 수 있는 로고 다섯 종만 남기고 나머지 칸은 파일 확장자와 기호로 채웠다
    holo6: (c) => comb(c, ['hx:.py:h', 'lg:js:hex:k', 'hx:.kt:h', 'lg:linux:hex:k', 'hx:.go:h', 'hx:</>:w', 'lg:git:hex:h', 'hx:.rs:k'], 'hx:{ }:h',
      ['lg:ts:hex:h', 'lg:android:hex:k', 'hx:.java:h', 'hx:.swift:w', 'hx:.sql:h', 'hx:$ _:k', 'hx:.cpp:h', 'hx:#!:k'], 'hx:LGTM:h'),
    // 홀3. 검정 스티커에 홀로그램 박: 스티커는 모두 검정, 로고와 글자와 테두리만 무지개빛. 장수를 줄이고 크게 붙였다
    holo3: (c) => `<section class="vb eb eb-stk eb-stk5">${SK.DEFS}${stkGroup(c, [
      ['tag:DEV.EVENT:k', 'l', 8, 14, -7, 1.12, [-52, -6, 0.6]], ['lg:js:sq:k', 'l', 26, 96, 8, 1.06, [-26, 84, 0.6]], ['hx:.py:k', 'l', 152, 46, -8, 1.02, null], ['lg:android:disc:k', 'l', 258, 104, 9, 0.84, null, '', 'in'],
      ['lg:linux:disc:k', 'r', 20, 6, 8, 1.06, [-22, -24, 0.6]], ['hx:.kt:k', 'r', 34, 96, -7, 1.02, [-24, 78, 0.58]], ['hx:</>:k', 'r', 148, 50, 10, 1, null], ['tag:git push:k', 'r', 236, 140, -6, 0.9, null, '', 'in'],
    ])}<div class="eb__c">${SLOGAN}</div></section>`,
    // 홀4. 글자와 기호만: 로고를 쓰지 않는다. 파일 확장자·명령어·기호를 홀로그램 딱지로
    holo4: (c) => `<section class="vb eb eb-stk eb-stk5">${SK.DEFS}${stkGroup(c, [
      ['file:.py:h', 'l', 16, 8, -9, 1, [-10, -18, 0.56]], ['term', 'l', 20, 108, 6, 0.88, [-40, 98, 0.52]], ['holo:brace', 'l', 124, 46, -8, 0.88, null], ['file:.kt:h', 'l', 226, 4, 8, 0.86, null],
      ['tag:git push', 'l', 182, 138, -5, 0.9, null], ['graph', 'l', 300, 96, 7, 0.66, null, '', 'in'],
      ['file:.ts:h', 'r', 18, 6, 9, 1, [-10, -18, 0.56]], ['laptop', 'r', 18, 112, -6, 0.88, [-24, 100, 0.52]], ['holo:code', 'r', 128, 50, 7, 0.86, null], ['tag:LGTM:k', 'r', 204, 10, -7, 0.94, null],
      ['prompt', 'r', 170, 122, 5, 0.8, null], ['file:.go:h', 'r', 296, 62, -10, 0.7, null, '', 'in'],
    ])}<div class="eb__c">${SLOGAN}</div></section>`,
    // 홀5. 행사 소재와 로고: 목걸이 명찰·마이크·행사 종류 딱지에 로고를 섞었다
    holo5: (c) => `<section class="vb eb eb-stk eb-stk5">${SK.DEFS}${stkGroup(c, [
      ['lanyard', 'l', 20, 34, -8, 1, [-24, 20, 0.56]], ['hw:해커톤', 'l', 110, 12, 6, 0.92, null], ['lg:python:disc:w', 'l', 134, 86, -9, 0.9, null], ['lg:android:disc:k', 'l', 238, 30, 10, 0.76, null],
      ['hw:밋업', 'l', 248, 130, -6, 0.9, null, '', 'in'],
      ['mic', 'r', 26, -2, 12, 0.92, [-8, -26, 0.56]], ['holo:logo', 'r', 6, 122, -5, 0.94, [-58, 108, 0.54]], ['hw:컨퍼런스', 'r', 100, 20, -7, 0.92, null], ['lg:js:hex:h', 'r', 180, 80, 8, 0.86, null],
      ['lg:linux:disc:h', 'r', 274, 16, -10, 0.72, null, '', 'in'], ['hw:세미나', 'r', 266, 132, 6, 0.84, null, '', 'in'],
    ])}<div class="eb__c">${SLOGAN}</div></section>`,

    // 스6. 스티커 무더기: 진한 바탕 한쪽에 큰 스티커를 한 무더기로 겹쳐 띠 밖으로 잘리게 한다 (Sticker Mule · StickerApp의 구성)
    stk6: (c) => `<section class="vb eb-stk eb-stk6">${SK.DEFS}${stkGroup(c, [
      ['term', 'r', 318, 92, -8, 1.3, null], ['pizza', 'r', 404, -30, 18, 1.25, null], ['hello', 'r', 196, -34, 7, 1.45, [70, -30, 0.8]], ['laptop', 'r', 300, 6, -10, 1.25, null],
      ['ticket', 'r', 150, 104, -9, 1.45, [56, 96, 0.8]], ['ring', 'r', 62, -26, 12, 1.4, [-30, -30, 0.85]], ['cal', 'r', 88, 76, 6, 1.5, [-14, 62, 0.86], 'data-act="today" title="오늘 행사로 가기"'],
      ['free', 'r', -28, 78, -12, 1.5, null, 'data-set="cost:무료" title="무료 행사만 보기"'], ['mic', 'r', -6, -40, 22, 1.3, null], ['smile', 'r', 250, 96, 10, 0.9, null], ['bolt', 'r', 44, 10, 14, 0.7, null],
    ])}<div class="s6-in"><div class="s6-t">${SLOGAN}</div></div></section>`,
    // 스7. 세 가지 색: 파랑·먹·흰색에 형광 연두 하나만 쓴다 (Veggie Taipei의 색 제한)
    stk7: (c) => `<section class="vb eb eb-stk eb-stk7">${SK.DEFS}${stkGroup(c, [
      ['tri:ring', 'l', 12, 8, -10, 1, [-36, -28, 0.6]], ['tri:ticket', 'l', 20, 126, 6, 0.9, [-44, 110, 0.52]], ['tri:laptop', 'l', 136, 70, -7, 0.9, null], ['tri:smile', 'l', 246, 6, 10, 0.78, null],
      ['tri:bolt', 'l', 258, 104, 12, 0.66, null, '', 'in'], ['tri:rsvp', 'l', 300, 62, -8, 0.8, null, '', 'in'],
      ['tri:hello', 'r', 12, 14, 8, 1, [-44, -18, 0.56]], ['tri:free', 'r', 16, 104, -8, 0.9, [-14, 92, 0.56], 'data-set="cost:무료" title="무료 행사만 보기"'], ['tri:cal', 'r', 150, 92, 6, 0.9, null, 'data-act="today" title="오늘 행사로 가기"'],
      ['tri:code', 'r', 168, 4, -9, 0.82, null], ['tri:term', 'r', 248, 118, -5, 0.78, null, '', 'in'], ['tri:pin', 'r', 268, 30, 12, 0.76, null, '', 'in'],
    ])}<div class="eb__c">${SLOGAN}</div></section>`,

    // G. 검색이 주인공
    search: (c) => `<section class="vb vb-search"><div class="vb__in">
      <label class="vs-q">${c.ic('search', 22)}<input id="bq" type="search" placeholder="행사명, 주최, 기술 키워드로 찾아보세요" aria-label="행사 검색"></label>
      <div class="vs-k"><span>추천 검색어</span>${['AI', '해커톤', 'AWS', '웨비나', '밋업', 'Kotlin'].map((k) => `<button class="press" data-act="bq" data-k="${k}">${k}</button>`).join('')}</div>
    </div></section>`,

    // H. 포스터 띠(화살표로 넘김)
    posters: (c) => {
      const it = within(c, 14).filter((e) => e.img).slice(0, 16);
      return `<section class="vb vb-posters"><div class="vp-lab"><small>앞으로 2주</small><b>행사 ${within(c, 14).length}건</b><span>포스터를 누르면 상세로 가요</span></div>
        <div class="vp-track" id="vpt"><div class="vp-row">${it.map((e) => `<a href="${e.href}">${c.thumb(e)}<em>${e.label}</em></a>`).join('')}</div></div>
        <button class="vp-ar is-l" data-act="vp" data-d="-1" aria-label="이전 포스터">${c.ic('back', 18)}</button><button class="vp-ar" data-act="vp" data-d="1" aria-label="다음 포스터">${c.ic('chevron', 18)}</button></section>`;
    },

    // I. 형광 공지 띠(멈춰 있음)
    ticker: (c) => {
      const it = deadlines(c).slice(0, 6).map((e) => `<a href="${e.href}"><em>${dayWord(c, e.en)} ${c.ft(e.en)}</em>${c.esc(e.title)}</a>`).join('<i>·</i>');
      return `<section class="vb vb-ticker"><b class="vt-lab">접수 마감</b><div class="vt-track"><div class="vt-row">${it}</div></div><button class="vt-all press" data-act="today">오늘 마감 ${c.CNT.today}건 보기</button>${xBtn(c, true)}</section>`;
    },

    // J. 큰 글자만
    type: (c) => `<section class="vb vb-type"><div class="vb__in">
      <h2>앞으로 일주일,<br>행사 <em>${within(c, 7).length}건</em>이 열리고 닫혀요.</h2>
      <ul><li><button data-act="today"><b>${c.CNT.today}</b>오늘 마감</button></li><li><button data-act="today"><b>${c.CNT.week}</b>이번 주 열리는 행사</button></li><li><button data-act="new"><b>${c.CNT.fresh}</b>새로 올라온 행사</button></li></ul>
    </div></section>`,

    // K. 다음 마감까지 남은 시간
    count: (c) => {
      const e = deadlines(c)[0]; if (!e) return '';
      return `<section class="vb vb-count" data-end="${e.en.getTime()}"><div class="vb__in">
        <div class="vc-t"><small>다음 접수 마감까지</small><a href="${e.href}"><b class="clamp1">${c.esc(e.title)}</b><span>${c.esc(e.organizer)} · ${dayWord(c, e.en)} ${c.ft(e.en)} 마감</span></a></div>
        <div class="vc-d" aria-live="off"><span><b data-u="h">00</b><small>시간</small></span><i>:</i><span><b data-u="m">00</b><small>분</small></span><i>:</i><span><b data-u="s">00</b><small>초</small></span></div>
        <a class="vc-go press" href="${e.href}">행사 보기</a>
      </div>${xBtn(c, true)}</section>`;
    },

    // L. 행사 잔디
    grass: (c) => {
      const cnt = {}; c.ALL.forEach((e) => { cnt[e.k] = (cnt[e.k] || 0) + 1; });
      const base = new Date(c.NOW.getFullYear(), c.NOW.getMonth(), c.NOW.getDate() - c.NOW.getDay()); // 이번 주 일요일
      const W = 8; let cols = '', months = '', prevM = -1;
      for (let w = 0; w < W; w++) {
        let col = '';
        for (let d = 0; d < 7; d++) {
          const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() + w * 7 + d), k = c.key(dt), n = cnt[k] || 0;
          const lv = n === 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : n <= 7 ? 3 : 4;
          col += `<button class="g${lv}${k === c.TODAY ? ' is-today' : ''}${k < c.TODAY ? ' is-past' : ''}" ${n ? `data-day="${k}"` : 'disabled'} title="${c.fdw(dt)} · ${n}건" aria-label="${c.fdw(dt)} 행사 ${n}건"></button>`;
        }
        const first = new Date(base.getFullYear(), base.getMonth(), base.getDate() + w * 7);
        months += `<span>${first.getMonth() !== prevM ? first.getMonth() + 1 + '월' : ''}</span>`; prevM = first.getMonth();
        cols += `<div>${col}</div>`;
      }
      const busy = Object.entries(cnt).filter(([k]) => k >= c.TODAY).sort((a, b) => b[1] - a[1])[0];
      const bd = busy ? new Date(busy[0] + 'T00:00:00') : c.NOW;
      return `<section class="vb vb-grass"><div class="vb__in">
        <div class="vg-t"><small>// 행사 잔디</small><h2>앞으로 8주, 날마다<br>이만큼 열리고 닫혀요</h2><p>칸을 누르면 그 날짜로 이동해요</p></div>
        <button class="vg-s" data-day="${busy ? busy[0] : c.TODAY}"><small>가장 붐비는 날</small><b>${c.fdw(bd)}</b><span>${busy ? busy[1] : 0}건 →</span></button>
        <div class="vg-g"><div class="vg-m">${months}</div><div class="vg-w"><span>일</span><span></span><span>화</span><span></span><span>목</span><span></span><span>토</span></div><div class="vg-c">${cols}</div>
          <div class="vg-l">적음<i class="g0"></i><i class="g1"></i><i class="g2"></i><i class="g3"></i><i class="g4"></i>많음</div></div>
      </div>${xBtn(c)}</section>`;
    },

    // M. 스펙 시트(큰 달 이름 + 격자선 + 고정폭 글자)
    sheet: (c) => `<section class="vb vb-sheet"><div class="vsh">
      <div class="vsh-m"><b>${c.NOW.getMonth() + 1}월</b><i></i></div>
      <div class="vsh-c"><p>${c.NOW.getFullYear()}.${c.pad(c.NOW.getMonth() + 1)}.${c.pad(c.NOW.getDate())} ${'일월화수목금토'[c.NOW.getDay()]} / 접수 중 ${c.UP.length}건 <i></i></p><button data-act="today">오늘-마감-${c.CNT.today}건/</button></div>
      <div class="vsh-b"><button class="press" data-act="today">이번 주 열리는 행사 ${c.CNT.week}건<span>↗</span></button><button class="press" data-act="new">새로 올라온 행사 ${c.CNT.fresh}건<span>↗</span></button></div>
    </div></section>`,

    // P. 낱말 색 블록(블록이 곧 필터)
    blocks: (c) => {
      const n = (fn) => c.UP.filter(fn).length;
      const b = (k, v, shape, col) => `<button class="bk bk--${shape} press${c.S[k] === v ? ' is-on' : ''}" style="--bc:${col}" data-set="${k}:${c.S[k] === v ? '전체' : v}">${v}</button>`;
      return `<section class="vb vb-blocks"><div class="vb__in"><h2>이번 주,<br>어떤 행사를 찾으세요?</h2>
        <div class="bks"><div><span># 분야</span>${b('topic', 'AI', 'pill', '#2d50ff')}${b('topic', '클라우드', 'rect', '#782fff')}${b('topic', '블록체인', 'pill', '#0e9ab9')}${b('topic', '보안', 'rect', '#0091eb')}</div>
          <div><span># 방식</span>${b('mode', '온라인', 'rect', '#0091eb')}${b('mode', '오프라인', 'pill', '#ab2aeb')}<span># 비용</span>${b('cost', '무료', 'rect', '#2d50ff')}<em>접수 중 ${c.UP.length}건 →</em></div></div>
      </div></section>`;
    },

    // N. 바로가기 타일
    tiles: (c) => {
      const G = {
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
        cal: '<rect x="3" y="5" width="18" height="16" rx="4"/><path d="M3 10.5h18" stroke="#fff" stroke-width="1.6"/><rect x="7" y="2.5" width="2.4" height="5" rx="1.2"/><rect x="14.600" y="2.500" width="2.400" height="5" rx="1.200"/>',
        spark: '<path d="M12 2.500l2.300 6.200 6.200 2.300-6.200 2.300L12 19.500l-2.300-6.200L3.500 11l6.200-2.300z"/><circle cx="19" cy="18.500" r="2"/>',
        gift: '<rect x="3.500" y="9" width="17" height="11.500" rx="2.500"/><rect x="2.500" y="6.500" width="19" height="4.500" rx="1.800"/><path d="M12 6.500v14" stroke="#fff" stroke-width="1.800"/><path d="M12 6.500c-2-3.500-5.500-3-5 0M12 6.500c2-3.500 5.500-3 5 0" fill="none" stroke="currentColor" stroke-width="1.800"/>',
      };
      const t = (g, col, label, n, attr) => `<button class="tl press" ${attr}><svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" style="color:${col}" aria-hidden="true">${G[g]}</svg><span>${label}</span><b>${n}<u>건</u></b></button>`;
      return `<section class="vb vb-tiles"><div class="vb__in">${t('clock', '#ff6f0f', '오늘 마감', c.CNT.today, 'data-act="today"')}${t('cal', '#0a84ff', '이번 주 열리는 행사', c.CNT.week, 'data-act="today"')}${t('spark', '#12b76a', '새로 올라온 행사', c.CNT.fresh, 'data-act="new"')}${t('gift', '#a855f7', '무료 행사', c.UP.filter((e) => e.cost === '무료').length, 'data-set="cost:무료"')}</div></section>`;
    },

    // O. 이번 주 한마디(쪽지)
    note: (c) => {
      const by = {}; within(c, 7).filter((e) => e.recruit).forEach((e) => { by[e.k] = (by[e.k] || 0) + 1; });
      const top = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
      const d = top ? new Date(top[0] + 'T00:00:00') : c.NOW;
      const f = c.UP.find((e) => e.id === 3489) || deadlines(c)[0];
      return `<section class="vb vb-note"><div class="vb__in">
        <div class="vn-p"><i></i><p>다가오는 <b>${c.DOW[d.getDay()]}요일(${c.fd(d)})</b>에 접수 마감이 <b>${top ? top[1] : 0}건</b> 몰려 있어요. <a href="${f.href}">${c.esc(f.title.split(' - ')[0])}</a>는 ${dayWord(c, f.en)} ${c.ft(f.en)}까지니 미리 챙기세요.</p><span>— 데브이벤트 드림</span></div>
        <button class="vn-go press" data-day="${top ? top[0] : c.TODAY}">그날 행사 보기 →</button>
      </div>${xBtn(c, true)}</section>`;
    },
  };

  /* ================= 구독 · SNS · 푸터 ================= */
  const copy = '<small>ⓒ 2022. <a href="' + L.gh + '" ' + ext + '>용감한 친구들 with 남송리 삼번지</a> all rights reserved.</small>';
  const nav = (lab, t) => `<a href="#main" data-toast="${t}">${lab}</a>`;
  // 링크 열 세 개가 있는 푸터
  const ftrCols = (cls) => `<footer class="fc ${cls || ''}"><div class="fc__in">
    <div class="fc__b"><a class="logo" href="#main">DEV.EVENT</a><p>개발자를 위한 행사 정보, 데브이벤트</p>${copy}</div>
    <div><h4>서비스</h4>${nav('행사 일정', '행사 일정으로 이동해요')}${nav('관심 행사', '관심 행사 화면으로 이동해요')}${nav('데브이벤트 소개', '데브이벤트 소개 화면으로 이동해요')}${nav('행사 등록 요청', '행사 등록 요청 화면으로 이동해요')}</div>
    <div><h4>소식 받기</h4><a href="${L.sub}" ${ext}>뉴스레터 구독</a><a href="${L.th}" ${ext}>Threads</a><a href="${L.ig}" ${ext}>Instagram</a></div>
    <div><h4>더 보기</h4><a href="${L.gh}" ${ext}>GitHub</a><a href="${L.whale}" ${ext}>웨일 확장 프로그램</a></div>
  </div></footer>`;
  // 한 줄짜리 푸터
  const ftrLine = (cls) => `<footer class="fl ${cls || ''}"><div class="fl__in"><a class="logo" href="#main">DEV.EVENT</a><span>개발자를 위한 행사 정보, 데브이벤트</span>
    <nav>${nav('데브이벤트 소개', '데브이벤트 소개 화면으로 이동해요')}${nav('행사 등록 요청', '행사 등록 요청 화면으로 이동해요')}<a href="${L.gh}" ${ext}>GitHub</a><a href="${L.whale}" ${ext}>웨일 확장 프로그램</a></nav>${copy}</div></footer>`;
  // 다음 주 뉴스레터에 실릴 행사(미리보기용)
  const nextWeek = (c) => {
    const mon = new Date(c.NOW.getFullYear(), c.NOW.getMonth(), c.NOW.getDate() + ((8 - c.NOW.getDay()) % 7 || 7));
    const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6, 23, 59);
    const it = c.UP.filter((e) => e.keyDate >= mon && e.keyDate <= sun).sort((a, b) => a.keyDate - b.keyDate);
    return { mon, sun, it, wk: Math.ceil(mon.getDate() / 7) };
  };
  const mailCard = (c, n) => {
    const w = nextWeek(c);
    return `<div class="mail"><div class="mail__h"><i>DE</i><div><b>데브이벤트</b><span>일요일 오후 8:00</span></div></div>
      <strong>${w.mon.getMonth() + 1}월 ${w.wk}주차 개발자 행사 ${w.it.length}건을 모았어요</strong>
      <ul>${w.it.slice(0, n || 4).map((e) => `<li><em>${c.fdw(e.keyDate)}</em><span class="clamp1">${c.esc(e.title)}</span><i>${e.recruit ? '접수 마감' : '행사'}</i></li>`).join('')}</ul>
      <p>…외 ${Math.max(0, w.it.length - (n || 4))}건 더</p></div>`;
  };

  const foots = {
    // 1. 색 띠 한 줄 + '소식 받기' 링크 열
    f1: (c) => `<div class="zone z1"><section class="z1-band"><div class="z1-in">
      <div class="z1-cal" aria-hidden="true"><b>매주 일요일</b><strong>20:00</strong></div>
      <div class="z1-t"><b><em>일요일 저녁 8시</em>, 한 주의 개발자 행사를 메일로 보내드려요</b><span>매주 한 번, 무료예요. 놓친 행사 없이 한 번에 훑어볼 수 있어요.</span></div>
      <a class="z1-btn press" href="${L.sub}" ${ext}>뉴스레터 무료 구독하기</a></div></section>${ftrCols('is-gray')}</div>`,

    // 2. 받는 방법 고르기(목록)
    f2: (c) => `<div class="zone z2"><div class="z2-in"><h2>새 행사 소식,<br>다양한 곳에서 확인해 보세요</h2><ul>
      <li><a href="${L.sub}" ${ext}><b>메일</b><span>일요일 저녁 8시 · 한 주 치를 모아서</span><em>구독하기</em>${c.ic('chevron', 18)}</a></li>
      <li><a href="${L.th}" ${ext}><b>Threads</b><span>@dev.event.official · 새 행사 소식을 가장 먼저</span><em>보러 가기</em>${c.ic('chevron', 18)}</a></li>
      <li><a href="${L.ig}" ${ext}><b>Instagram</b><span>@dev.event.official · 익숙한 피드에서</span><em>보러 가기</em>${c.ic('chevron', 18)}</a></li></ul></div>${ftrLine()}</div>`,

    // 3. 지난 호 미리보기
    f3: (c) => `<div class="zone z3"><div class="z3-in"><div class="z3-t"><small>뉴스레터</small><h2>일요일 저녁 8시에<br>이런 메일이 와요</h2><p>다음 한 주의 마감과 행사를 날짜순으로 정리해 보내드려요. 무료예요.</p>
      <a class="z3-btn press" href="${L.sub}" ${ext}>무료로 구독하기</a><span class="z3-s">메일이 번거롭다면 <a href="${L.th}" ${ext}>Threads</a>나 <a href="${L.ig}" ${ext}>Instagram</a>에서도 볼 수 있어요.</span></div>
      <div class="z3-m">${mailCard(c, 5)}</div></div>${ftrLine()}</div>`,

    // 4. 선을 드러낸 표 모양 푸터(구독 영역 없음)
    f4: (c) => `<div class="zone z4"><footer class="z4-in">
      <div class="z4-b"><a class="logo" href="#main">DEV.EVENT</a><p>개발자를 위한 행사 정보, 데브이벤트</p><a class="z4-btn press" href="${L.sub}" ${ext}>뉴스레터 구독하기 <span>↗</span></a></div>
      <div><h4>01 / 서비스</h4>${nav('행사 일정', '행사 일정으로 이동해요')}${nav('관심 행사', '관심 행사 화면으로 이동해요')}${nav('데브이벤트 소개', '데브이벤트 소개 화면으로 이동해요')}${nav('행사 등록 요청', '행사 등록 요청 화면으로 이동해요')}</div>
      <div><h4>02 / 소식 받기</h4><a href="${L.sub}" ${ext}>뉴스레터<i>일요일 저녁 8시</i></a><a href="${L.th}" ${ext}>Threads<i>새 소식을 가장 먼저</i></a><a href="${L.ig}" ${ext}>Instagram<i>익숙한 피드에서</i></a></div>
      <div><h4>03 / 더 보기</h4><a href="${L.gh}" ${ext}>GitHub</a><a href="${L.whale}" ${ext}>웨일 확장 프로그램</a></div>
      <div class="z4-c">${copy}</div></footer></div>`,

    // 5. 아주 큰 로고가 바닥에 깔린 어두운 푸터
    f5: (c) => `<div class="zone z5"><div class="z5-in"><div class="z5-top"><p>일요일 저녁 8시,<br>한 주의 개발자 행사를 메일로.</p><a class="z5-btn press" href="${L.sub}" ${ext}>무료로 구독하기</a>
      <nav><a href="${L.th}" ${ext}>Threads ↗</a><a href="${L.ig}" ${ext}>Instagram ↗</a><a href="${L.gh}" ${ext}>GitHub ↗</a><a href="${L.whale}" ${ext}>웨일 확장 ↗</a>${nav('데브이벤트 소개', '데브이벤트 소개 화면으로 이동해요')}${nav('행사 등록 요청', '행사 등록 요청 화면으로 이동해요')}</nav></div>
      <div class="z5-c"><span>개발자를 위한 행사 정보, 데브이벤트</span>${copy}</div></div><div class="z5-w" aria-hidden="true">DEV.EVENT</div></div>`,

    // 6. 한 문장 안에 다 넣기
    f6: (c) => `<div class="zone z6"><div class="z6-in"><p>새 행사 소식은 <a class="hl" href="${L.sub}" ${ext}>메일</a>로 일요일 저녁 8시에 한 번,<br>또는 <a href="${L.th}" ${ext}>Threads</a>와 <a href="${L.ig}" ${ext}>Instagram</a>에서 그때그때 받아 보세요.</p></div>${ftrLine()}</div>`,

    // 7. 구독 띠 + 바로 밑 줄에 SNS를 한 문장씩
    f7: (c) => `<div class="zone z7"><section class="z7-band"><div class="z7-in"><h2>개발자 행사, 놓치지 마세요.<br><em>매주 일요일 저녁 8시</em> 메일로 받아 보세요.</h2>
      <form class="z7-f" onsubmit="return false"><input type="email" placeholder="이메일을 입력해 주세요" aria-label="이메일 주소"><button class="press" data-toast="구독 신청이 접수됐어요">뉴스레터 구독하기</button><span>무료예요. 메일 아래 링크로 언제든 그만 받을 수 있어요.</span></form></div></section>
      <footer class="z7-ft"><div class="z7-row"><a href="${L.th}" ${ext}><b>Threads</b><span>새 행사 소식을 가장 먼저 전하는 채널</span></a><a href="${L.ig}" ${ext}><b>Instagram</b><span>익숙한 피드에서 받는 행사 소식</span></a>
        <nav>${nav('데브이벤트 소개 ›', '데브이벤트 소개 화면으로 이동해요')}${nav('행사 등록 요청 ›', '행사 등록 요청 화면으로 이동해요')}<a href="${L.gh}" ${ext}>GitHub ›</a><a href="${L.whale}" ${ext}>웨일 확장 ›</a></nav></div>
        <div class="z7-c"><span>DEV.EVENT · 개발자를 위한 행사 정보, 데브이벤트</span>${copy}</div></footer></div>`,

    // 8. 채널을 탭으로 바꿔 보며 고르기
    f8: (c) => {
      const ch = c.S.ch || 'mail', e = c.UP.find((x) => x.isNew && x.img) || c.UP.find((x) => x.img);
      const P = {
        mail: { t: '메일로 한 주 치를 한 번에', d: '일요일 저녁 8시에 다음 주 마감과 행사를 날짜순으로 정리해 보내드려요.', b: '무료로 구독하기', u: L.sub, pv: mailCard(c, 3) },
        th: { t: 'Threads에서 가장 먼저', d: '새 행사가 올라오면 바로 알려 드려요. @dev.event.official', b: 'Threads에서 보기', u: L.th,
          pv: `<div class="post"><div class="post__h"><i>DE</i><b>dev.event.official</b><span>2시간</span></div><p>새 행사가 올라왔어요.<br><b>${c.esc(e.title)}</b><br>${e.recruit ? c.fdw(e.en) + ' ' + c.ft(e.en) + '까지 접수' : e.range} · ${e.cost}</p>${c.thumb(e)}</div>` },
        ig: { t: 'Instagram 피드에서', d: '익숙한 피드에서 행사 소식을 카드로 받아 보세요. @dev.event.official', b: 'Instagram에서 보기', u: L.ig,
          pv: `<div class="grid9">${c.UP.filter((x) => x.img).slice(0, 6).map((x) => `<span style="background-image:url('${c.esc(x.img)}')"></span>`).join('')}</div>` },
      }[ch];
      return `<div class="zone z8"><div class="z8-in"><div class="z8-l"><h2>새 행사 소식 받기</h2>
        <div class="z8-seg" role="tablist">${[['mail', '메일'], ['th', 'Threads'], ['ig', 'Instagram']].map(([k, n]) => `<button role="tab" aria-selected="${k === ch}" class="${k === ch ? 'is-on' : ''}" data-act="ch" data-k="${k}">${n}</button>`).join('')}</div>
        <h3>${P.t}</h3><p>${P.d}</p><a class="z8-btn press" href="${P.u}" ${ext}>${P.b}</a></div><div class="z8-r">${P.pv}</div></div>${ftrLine()}</div>`;
    },

    // 9. 한 주의 리듬으로 설명하기
    f9: (c) => `<div class="zone z9"><div class="z9-in"><h2>평일엔 SNS로 바로,<br>일요일엔 메일로 한 번에</h2>
      <div class="z9-w"><div class="z9-d">${['월', '화', '수', '목', '금', '토'].map((d) => `<span>${d}<i></i></span>`).join('')}</div><div class="z9-sun"><span>일</span><b>저녁 8시</b></div>
        <div class="z9-a"><b>새 행사가 올라올 때마다</b><span><a href="${L.th}" ${ext}>Threads</a> · <a href="${L.ig}" ${ext}>Instagram</a> @dev.event.official</span></div>
        <div class="z9-b"><b>한 주 치를 모아서</b><a class="press" href="${L.sub}" ${ext}>메일 구독하기</a></div></div></div>${ftrLine()}</div>`,

    // 10. 터미널 명령처럼
    f10: (c) => `<div class="zone z10"><div class="z10-in"><div class="tw"><div class="tw__bar"><i></i><i></i><i></i><span>소식 받기 — zsh</span></div><div class="tw__b">
      <a href="${L.sub}" ${ext}><span class="p">$</span> devevent subscribe <u>--mail</u><em># 일요일 저녁 8시, 한 주 치를 모아서 · 무료</em></a>
      <a href="${L.th}" ${ext}><span class="p">$</span> devevent follow <u>--threads</u><em># 새 행사 소식을 가장 먼저</em></a>
      <a href="${L.ig}" ${ext}><span class="p">$</span> devevent follow <u>--instagram</u><em># 익숙한 피드에서</em></a>
      <p><span class="p">$</span> <i class="cur"></i></p></div></div></div>${ftrLine('is-mono')}</div>`,
  };

  /* ================= 동작 ================= */
  let timer = null, timer2 = null;
  function after(c) {
    document.documentElement.dataset.banner = c.OPT.banner;
    clearInterval(timer); clearInterval(timer2);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 안내판: 글자가 바뀌는 칸만 차례로 넘긴다
    const bd = document.querySelector('.bd-g');
    if (bd) {
      const msgs = JSON.parse(bd.dataset.m), tiles = [...bd.querySelectorAll('i')]; let k = 0;
      const show = (m) => { const flat = [...m.join('')]; tiles.forEach((t, i) => { const ch = (flat[i] || '').trim(); if (t.textContent === ch) return; setTimeout(() => { t.classList.add('go'); setTimeout(() => { t.textContent = ch; }, 150); setTimeout(() => t.classList.remove('go'), 310); }, (i % 16) * 38 + Math.floor(i / 16) * 130); }); };
      if (!still) timer2 = setInterval(() => { if (!bd.isConnected) return clearInterval(timer2); k = (k + 1) % msgs.length; show(msgs[k]); }, 5200);
    }
    if (still) document.querySelectorAll('.eb-stk svg').forEach((v) => v.pauseAnimations && v.pauseAnimations());
    // 스티커: 끌어서 옮긴다. 거의 움직이지 않았으면 누른 것으로 본다
    const sg = document.querySelector('.stk-g');
    if (sg) {
      let cur = null, sx = 0, sy = 0, bx = 0, by = 0, moved = false, z = 10, drag = false;
      sg.addEventListener('pointerdown', (e) => { const t = e.target.closest('.stk'); if (!t) return; cur = t; moved = false; sx = e.clientX; sy = e.clientY; bx = parseFloat(t.style.getPropertyValue('--tx')) || 0; by = parseFloat(t.style.getPropertyValue('--ty')) || 0; t.setPointerCapture(e.pointerId); });
      sg.addEventListener('pointermove', (e) => { if (!cur) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (!moved && Math.hypot(dx, dy) < 5) return; moved = true; cur.classList.add('is-drag'); cur.style.zIndex = ++z; cur.style.setProperty('--tx', bx + dx + 'px'); cur.style.setProperty('--ty', by + dy + 'px'); });
      const end = () => { if (!cur) return; cur.classList.remove('is-drag'); if (moved) { drag = true; setTimeout(() => { drag = false; }, 0); } cur = null; };
      sg.addEventListener('pointerup', end); sg.addEventListener('pointercancel', end);
      sg.addEventListener('click', (e) => { if (drag) { e.stopPropagation(); e.preventDefault(); } }, true);
    }
    // 글자 그림: 사인 곡선 세 개를 겹쳐 기호의 진하기로 바꾼다. 가운데(글자 자리)는 비운다
    const ap = document.querySelector('.as-p');
    if (ap) {
      const RAMP = '   .·:;+x%#@', probe = document.createElement('span'); probe.textContent = '0000000000'; ap.appendChild(probe); const cw = probe.getBoundingClientRect().width / 10 || 7.2; ap.textContent = '';
      const draw = (t) => {
        const cols = Math.ceil(ap.clientWidth / cw) + 1, rows = Math.ceil(ap.clientHeight / 14); let o = '';
        for (let y = 0; y < rows; y++) { for (let x = 0; x < cols; x++) {
          const m = Math.min(1, Math.max(0, Math.hypot(((x - cols / 2) * cw) / Math.min(330, ap.clientWidth * 0.4), (y - rows / 2) / (rows * 0.62)) - 0.72) * 2.2);
          const v = (Math.sin(x * 0.21 + t) + Math.sin(y * 0.47 - t * 1.2) + Math.sin((x * 0.5 - y) * 0.31 + t * 0.7) + Math.sin(Math.hypot(x * 0.5 - cols * 0.25, y - rows / 2) * 0.22 - t)) / 4;
          o += RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.floor((v * 0.5 + 0.5) * m * RAMP.length)))];
        } o += '\n'; }
        ap.textContent = o;
      };
      let last = 0; const loop = (ts) => { if (!ap.isConnected) return; if (ts - last > 90) { last = ts; draw(ts / 1100); } requestAnimationFrame(loop); };
      draw(0); if (!still) requestAnimationFrame(loop);
    }
    const cd = document.querySelector('.vb-count');
    if (cd) {
      const t0 = Date.now(), end = Number(cd.dataset.end), base = c.NOW.getTime();
      const tick = () => { const ms = Math.max(0, end - (base + (Date.now() - t0))), s = Math.floor(ms / 1000); cd.querySelector('[data-u="h"]').textContent = c.pad(Math.floor(s / 3600)); cd.querySelector('[data-u="m"]').textContent = c.pad(Math.floor((s % 3600) / 60)); cd.querySelector('[data-u="s"]').textContent = c.pad(s % 60); };
      tick(); timer = setInterval(tick, 1000);
    }
    const bq = document.getElementById('bq'), q = document.getElementById('q');
    if (bq && q) { bq.value = q.value; bq.addEventListener('input', () => { q.value = bq.value; q.dispatchEvent(new Event('input')); }); }
  }
  function act(name, el, c, api) {
    if (name === 'bq') { const bq = document.getElementById('bq'); bq.value = bq.value === el.dataset.k ? '' : el.dataset.k; bq.dispatchEvent(new Event('input')); return true; }
    if (name === 'vp') { const t = document.getElementById('vpt'); t.scrollBy({ left: Number(el.dataset.d) * 675, behavior: 'smooth' }); return true; }
    if (name === 'ch') { c.S.ch = el.dataset.k; const z = document.querySelector('.zone'); if (z) z.outerHTML = foots.f8(c); return true; }
    return false;
  }
  // 소식 받기 없이 푸터만 (소개·오류 화면)
  const footOnly = () => `<div class="zone zf">${ftrCols('is-gray')}</div>`;
  window.VARIANTS = { banners, foots, after, act, footOnly };
})();
