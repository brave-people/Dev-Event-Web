/* 스티커 그림 세트. 이미지 파일 없이 SVG로 그린다.
   흰 칼선 테두리와 그림자는 그림마다 그리지 않고, DEFS 의 필터(#diecut)가 그림의 윤곽을 따라 자동으로 만든다.
   art(name, c) → SVG 문자열. c 는 app.js 의 도구 모음(오늘 날짜 등). */
(function () {
  const INK = '#15171c';
  const F = "font-family=\"'Pretendard Variable', Pretendard, sans-serif\"";
  const M = "font-family=\"'JetBrains Mono', ui-monospace, Menlo, monospace\"";
  const H = "font-family=\"'Gaegu', 'Pretendard Variable', cursive\"";
  const svg = (w, h, body) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`;
  const star = (cx, cy, n, r1, r2) => Array.from({ length: n * 2 }, (_, i) => { const r = i % 2 ? r2 : r1, a = (Math.PI * i) / n - Math.PI / 2; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(' ');

  const ART = {
    // "Hello my name is" 이름표
    hello: () => svg(126, 88, `<rect width="126" height="88" rx="11" fill="#e5383b"/>
      <text x="63" y="22" text-anchor="middle" ${F} font-size="19" font-weight="900" fill="#fff" letter-spacing="1.5">HELLO</text>
      <text x="63" y="33" text-anchor="middle" ${F} font-size="8.5" font-weight="700" fill="#fff" letter-spacing=".6">my name is</text>
      <rect x="7" y="39" width="112" height="42" rx="6" fill="#fff"/>
      <text x="63" y="71" text-anchor="middle" ${H} font-size="33" font-weight="700" fill="${INK}" transform="rotate(-4 63 62)">개발자</text>`),
    // 오늘 날짜가 찍힌 일력
    cal: (c) => { const d = c ? c.NOW : new Date(); return svg(78, 88, `<rect x="2" y="8" width="74" height="78" rx="11" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
      <path d="M2 30V19a11 11 0 0111-11h52a11 11 0 0111 11v11z" fill="#ff4d4f" stroke="${INK}" stroke-width="3.5"/>
      <path d="M22 2v12M56 2v12" stroke="${INK}" stroke-width="5"/>
      <text x="39" y="25.5" text-anchor="middle" ${F} font-size="12" font-weight="800" fill="#fff">${d.getMonth() + 1}월</text>
      <text x="39" y="72" text-anchor="middle" ${F} font-size="39" font-weight="900" fill="${INK}" letter-spacing="-1.5">${d.getDate()}</text>`); },
    // 입장권
    ticket: () => svg(132, 62, `<path d="M9 2h114a7 7 0 017 7v12a10 10 0 000 20v12a7 7 0 01-7 7H9a7 7 0 01-7-7V41a10 10 0 000-20V9a7 7 0 017-7z" fill="#ffd84d" stroke="${INK}" stroke-width="3.5"/>
      <path d="M94 8v46" stroke="${INK}" stroke-width="2.5" stroke-dasharray="1 6.5"/>
      <text x="52" y="28" text-anchor="middle" ${M} font-size="12.5" font-weight="700" fill="${INK}" letter-spacing="1">ADMIT</text>
      <text x="52" y="46" text-anchor="middle" ${F} font-size="18" font-weight="900" fill="${INK}" letter-spacing=".5">ONE</text>
      <polygon points="${star(111, 31, 5, 10, 4.3)}" fill="${INK}"/>`),
    // 노트북
    laptop: () => svg(108, 76, `<rect x="14" y="2" width="80" height="54" rx="7" fill="#1d2430" stroke="${INK}" stroke-width="3.5"/>
      <text x="54" y="37" text-anchor="middle" ${M} font-size="22" font-weight="700" fill="#5fe1ff">&lt;/&gt;</text>
      <path d="M2 62h104l-6 12H8z" fill="#cdd5df" stroke="${INK}" stroke-width="3.5"/><path d="M44 62h20v4H44z" fill="${INK}"/>`),
    // 종이컵 커피
    coffee: () => svg(62, 88, `<path d="M9 22h44l-5 62H14z" fill="#fff8ee" stroke="${INK}" stroke-width="3.5"/>
      <path d="M11.5 40h39l-2 24h-35z" fill="#19c39a" stroke="${INK}" stroke-width="3"/>
      <rect x="3" y="11" width="56" height="12" rx="4" fill="${INK}"/><rect x="13" y="3" width="36" height="9" rx="3" fill="${INK}"/>
      <text x="31" y="57.5" text-anchor="middle" ${M} font-size="13" font-weight="700" fill="#053b2e">{ }</text>`),
    // 피자 조각
    pizza: () => svg(84, 88, `<path d="M6 16C28 2 56 2 78 16L44 84z" fill="#ffc94d" stroke="${INK}" stroke-width="3.5"/>
      <path d="M6 16C28 2 56 2 78 16l-6 12C52 18 32 18 12 28z" fill="#e3913a" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="33" cy="40" r="7" fill="#e5383b" stroke="${INK}" stroke-width="2.5"/><circle cx="52" cy="46" r="6" fill="#e5383b" stroke="${INK}" stroke-width="2.5"/><circle cx="43" cy="63" r="5" fill="#e5383b" stroke="${INK}" stroke-width="2.5"/>`),
    // 마이크
    mic: () => svg(58, 94, `<path d="M21 46h16l-3 44H24z" fill="${INK}" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="29" cy="27" r="24" fill="#d6dce6" stroke="${INK}" stroke-width="3.5"/>
      <path d="M8 20h42M6 31h46M13 42h32M20 5v44M32 3v48M42 8v38" stroke="${INK}" stroke-width="1.6" opacity=".55"/>
      <rect x="17" y="46" width="24" height="9" rx="3" fill="#0043ff" stroke="${INK}" stroke-width="3"/>`),
    // 말풍선
    bubble: () => svg(124, 70, `<path d="M14 3h96a11 11 0 0111 11v28a11 11 0 01-11 11H52L32 67l3-14H14A11 11 0 013 42V14A11 11 0 0114 3z" fill="#0043ff" stroke="${INK}" stroke-width="3.5"/>
      <text x="62" y="36" text-anchor="middle" ${F} font-size="20" font-weight="900" fill="#fff" letter-spacing="-.5">밋업 가자!</text>`),
    // 별 모양 딱지
    free: () => svg(88, 88, `<polygon points="${star(44, 44, 14, 41, 33)}" fill="#ff6b57" stroke="${INK}" stroke-width="3.5"/>
      <text x="44" y="52" text-anchor="middle" ${F} font-size="24" font-weight="900" fill="#fff" transform="rotate(-9 44 44)">무료</text>`),
    // 위치 핀
    pin: () => svg(60, 80, `<path d="M30 77S56 49 56 29A26 26 0 004 29c0 20 26 48 26 48z" fill="#e5383b" stroke="${INK}" stroke-width="3.5"/><circle cx="30" cy="29" r="10" fill="#fff" stroke="${INK}" stroke-width="3"/>`),
    // 엔터 키
    key: () => svg(74, 72, `<rect x="2" y="2" width="70" height="68" rx="13" fill="#c5ccd8" stroke="${INK}" stroke-width="3.5"/>
      <rect x="9" y="6" width="56" height="52" rx="9" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <path d="M48 20v14H26m7-7l-7 7 7 7" stroke="${INK}" stroke-width="4.5"/>`),
    // 번개
    bolt: () => svg(60, 88, `<path d="M37 3L5 50h21l-6 35 35-51H33z" fill="#ffd84d" stroke="${INK}" stroke-width="3.5"/>`),
    // 터미널 창
    term: () => svg(136, 76, `<rect x="2" y="2" width="132" height="72" rx="11" fill="#0d1117" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="16" cy="15" r="4" fill="#ff5f57"/><circle cx="29" cy="15" r="4" fill="#febc2e"/><circle cx="42" cy="15" r="4" fill="#28c840"/>
      <text x="13" y="42" ${M} font-size="13.5" font-weight="700" fill="#3fd97c">$ git push</text>
      <text x="13" y="60" ${M} font-size="11" font-weight="500" fill="#8b949e">→ 행사 가는 중…</text>`),
    // 둥근 디데이 딱지
    dday: () => svg(80, 80, `<circle cx="40" cy="40" r="37" fill="#ff8a1f" stroke="${INK}" stroke-width="3.5"/><circle cx="40" cy="40" r="29" stroke="#fff" stroke-width="2" stroke-dasharray="2 5"/>
      <text x="40" y="48" text-anchor="middle" ${M} font-size="23" font-weight="800" fill="#fff">D-3</text>`),
    // 서비스 로고 딱지
    logo: () => svg(146, 46, `<rect x="2" y="2" width="142" height="42" rx="10" fill="${INK}" stroke="${INK}" stroke-width="3.5"/>
      <text x="73" y="31" text-anchor="middle" ${F} font-size="21" font-weight="900" fill="#fff" letter-spacing=".3">DEV.EVENT</text>`),
    // 톱니 씰: 오늘 마감 건수 (캐릿의 주황 톱니 씰 배지에서)
    seal: (c) => { const n = c && c.CNT ? c.CNT.today : 0, pts = Array.from({ length: 180 }, (_, i) => { const a = (Math.PI * 2 * i) / 180, r = 43 + 3.4 * Math.cos(16 * a); return `${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`; }).join(' ');
      return svg(100, 100, `<polygon points="${pts}" fill="#ff5a1f" stroke="${INK}" stroke-width="3.5"/>
        <g transform="rotate(-10 50 50)"><text x="50" y="41" text-anchor="middle" ${F} font-size="15" font-weight="800" fill="#fff">오늘 마감</text><text x="50" y="70" text-anchor="middle" ${F} font-size="29" font-weight="900" fill="#fff" letter-spacing="-.5">${n}건</text></g>`); },
    // 둘레 글자 배지 (Veggie Taipei의 둘레 글자 원형 배지에서)
    ring: () => svg(108, 108, `<circle cx="54" cy="54" r="51" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
      <text ${M} font-size="10.6" font-weight="700" fill="${INK}" letter-spacing="1.25"><textPath href="#ringp">DEV EVENT · 개발자 행사는 모두 여기에 · </textPath></text>
      <circle cx="54" cy="54" r="27" fill="#0043ff" stroke="${INK}" stroke-width="3"/><text x="54" y="63" text-anchor="middle" ${F} font-size="26" font-weight="900" fill="#fff" letter-spacing="-1">D.E</text>`),
    // 톱니 가장자리 라벨
    rsvp: () => { const z = (x, d) => Array.from({ length: 7 }, (_, i) => `${x + (i % 2 ? d : 0)},${3 + i * 7}`).join(' L');
      return svg(112, 48, `<path d="M${z(8, -6)} L${z(104, 6).split(' L').reverse().join(' L')} Z" fill="#d7ff3f" stroke="${INK}" stroke-width="3.5"/>
        <text x="56" y="33" text-anchor="middle" ${M} font-size="23" font-weight="800" fill="${INK}" letter-spacing="2">RSVP</text>`); },
    // 팔각 스마일
    smile: () => svg(80, 80, `<polygon points="25,3 55,3 77,25 77,55 55,77 25,77 3,55 3,25" fill="#d7ff3f" stroke="${INK}" stroke-width="3.5"/>
      <path d="M24 34l6-7 6 7M44 34l6-7 6 7" stroke="${INK}" stroke-width="4.5"/><path d="M24 48c5 12 27 12 32 0" stroke="${INK}" stroke-width="4.5"/>`),
    // 코드 기호 원
    code: () => svg(78, 78, `<circle cx="39" cy="39" r="36" fill="#0043ff" stroke="${INK}" stroke-width="3.5"/><text x="39" y="47" text-anchor="middle" ${M} font-size="24" font-weight="700" fill="#fff">&lt;/&gt;</text>`),
    // 404
    e404: () => svg(92, 52, `<rect x="2" y="2" width="88" height="48" rx="9" fill="#fff" stroke="${INK}" stroke-width="3.5"/><text x="46" y="36" text-anchor="middle" ${M} font-size="28" font-weight="800" fill="${INK}">404</text>`),
    // 중괄호 원
    brace: () => svg(78, 78, `<circle cx="39" cy="39" r="36" fill="#19c39a" stroke="${INK}" stroke-width="3.5"/><text x="39" y="48" text-anchor="middle" ${M} font-size="27" font-weight="800" fill="#fff">{ }</text>`),
    // 커밋 그래프: 가지가 갈라졌다 합쳐진다 (특정 도구의 로고가 아닌 일반 그림)
    graph: () => svg(92, 84, `<rect x="2" y="2" width="88" height="80" rx="13" fill="#0d1117" stroke="${INK}" stroke-width="3.5"/>
      <path d="M26 66V18M26 54c0-14 38-8 38-24" stroke="#8b949e" stroke-width="4"/>
      <circle cx="26" cy="18" r="7" fill="#3fd97c" stroke="${INK}" stroke-width="2.5"/><circle cx="26" cy="42" r="7" fill="#3fd97c" stroke="${INK}" stroke-width="2.5"/><circle cx="26" cy="66" r="7" fill="#3fd97c" stroke="${INK}" stroke-width="2.5"/><circle cx="64" cy="30" r="7" fill="#ff8a1f" stroke="${INK}" stroke-width="2.5"/>`),
    // 깜빡이는 프롬프트
    prompt: () => svg(84, 66, `<rect x="2" y="2" width="80" height="62" rx="12" fill="#0d1117" stroke="${INK}" stroke-width="3.5"/>
      <path d="M18 22l13 11-13 11" stroke="#3fd97c" stroke-width="5.5"/><rect x="40" y="39" width="26" height="6" rx="2" fill="#3fd97c"><animate attributeName="opacity" values="1;1;0;0" dur="1.1s" repeatCount="indefinite"/></rect>`),
    // 고퍼: Go 언어의 마스코트. Renee French의 원작을 따라 그린 것 (CC BY 4.0, 출처 표기 필요)
    gopher: () => svg(80, 92, `<circle cx="13" cy="22" r="9.5" fill="#6ad7e5" stroke="${INK}" stroke-width="3.5"/><circle cx="67" cy="22" r="9.5" fill="#6ad7e5" stroke="${INK}" stroke-width="3.5"/>
      <path d="M8 90V44C8 21 22 6 40 6s32 15 32 38v46z" fill="#6ad7e5" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="26" cy="36" r="13" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="54" cy="36" r="13" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <circle cx="30" cy="38" r="4.6" fill="${INK}"/><circle cx="50" cy="38" r="4.6" fill="${INK}"/><circle cx="31.6" cy="36.4" r="1.5" fill="#fff"/><circle cx="51.6" cy="36.4" r="1.5" fill="#fff"/>
      <rect x="35" y="57" width="10" height="12" rx="2.5" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="M40 58v10" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="40" cy="56" rx="11.5" ry="7.5" fill="#f6d2a2" stroke="${INK}" stroke-width="3"/><ellipse cx="40" cy="51" rx="5.5" ry="3.8" fill="${INK}"/>`),
    // 버그: 무당벌레
    bug: () => svg(80, 88, `<path d="M15 36L4 27M13 54H2M16 70L5 79M65 36l11-9M67 54h11M64 70l11 9M31 15L25 4M49 15l6-11" stroke="${INK}" stroke-width="4.5"/>
      <ellipse cx="40" cy="54" rx="27" ry="31" fill="#e5383b" stroke="${INK}" stroke-width="3.5"/>
      <path d="M15.5 41C18 24 28 13 40 13s22 11 24.5 28z" fill="${INK}" stroke="${INK}" stroke-width="3.5"/><path d="M40 41v44" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="27" cy="56" r="5" fill="${INK}"/><circle cx="53" cy="56" r="5" fill="${INK}"/><circle cx="30" cy="72" r="4" fill="${INK}"/><circle cx="50" cy="72" r="4" fill="${INK}"/>`),
    // 데이터베이스
    db: () => svg(68, 84, `<path d="M4 18v48c0 8 13.4 14 30 14s30-6 30-14V18z" fill="#19c39a" stroke="${INK}" stroke-width="3.5"/>
      <path d="M4 34c0 8 13.4 14 30 14s30-6 30-14M4 50c0 8 13.4 14 30 14s30-6 30-14" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="34" cy="18" rx="30" ry="14" fill="#a8f5dd" stroke="${INK}" stroke-width="3.5"/>`),
    // 칩
    chip: () => svg(84, 84, `<path d="M30 3v14M42 3v14M54 3v14M30 67v14M42 67v14M54 67v14M3 30h14M3 42h14M3 54h14M67 30h14M67 42h14M67 54h14" stroke="${INK}" stroke-width="5"/>
      <rect x="14" y="14" width="56" height="56" rx="10" fill="#8a6bff" stroke="${INK}" stroke-width="3.5"/><rect x="27" y="27" width="30" height="30" rx="5" fill="#fff" stroke="${INK}" stroke-width="3"/>
      <path d="M36 36h12v12H36z" fill="${INK}"/>`),
    // 목걸이 명찰: 행사 참가자 이름표
    lanyard: () => svg(92, 118, `<path d="M30 2l14 30M62 2L48 32" stroke="#0043ff" stroke-width="8"/><rect x="38" y="26" width="16" height="12" rx="4" fill="#c5ccd8" stroke="${INK}" stroke-width="3"/>
      <rect x="6" y="36" width="80" height="80" rx="10" fill="#fff" stroke="${INK}" stroke-width="3.5"/><path d="M6 60V46a10 10 0 0110-10h60a10 10 0 0110 10v14z" fill="#0043ff" stroke="${INK}" stroke-width="3.5"/>
      <text x="46" y="54" text-anchor="middle" ${F} font-size="12.5" font-weight="900" fill="#fff" letter-spacing=".6">DEV EVENT</text>
      <text x="46" y="90" text-anchor="middle" ${H} font-size="27" font-weight="700" fill="${INK}">개발자</text><text x="46" y="106" text-anchor="middle" ${M} font-size="8.5" font-weight="700" fill="#8b91a0" letter-spacing="1.2">ATTENDEE</text>`),
  };
  // 글자 딱지: 행사 종류. [배경, 글자색, 모서리]
  const WORD = { 밋업: ['#ff6b57', '#fff', 999], 해커톤: ['#19c39a', '#053b2e', 8], 컨퍼런스: ['#0b1b4d', '#fff', 999], 세미나: ['#fff', '#0043ff', 8], 온라인: ['#8fd3ff', '#06264a', 999], AI: ['#15171c', '#ffd84d', 8], NEW: ['#0043ff', '#fff', 6], LGTM: ['#dfffd6', '#167a2e', 6] };
  const word = (t) => { const [bg, fg, r] = WORD[t] || ['#fff', INK, 8], w = Math.round([...t].reduce((n, ch) => n + (/[ -~]/.test(ch) ? 12.5 : 19.5), 0) + 30);
    return svg(w, 44, `<rect x="2" y="2" width="${w - 4}" height="40" rx="${Math.min(r, 20)}" fill="${bg}" stroke="${INK}" stroke-width="3.5"/><text x="${w / 2}" y="30" text-anchor="middle" ${F} font-size="19" font-weight="900" fill="${fg}">${t}</text>`); };

  /* ----- 기술 로고 스티커 (2026-11-16). 도형은 logos.js -----
     이름: lg:<로고>:<모양>:<판>
     모양 cut(로고 모양대로) · disc(원) · hex(육각, 꼭짓점이 위) · sq(둥근 네모)
     판   w(흰 바탕 + 공식 색 로고) · h(홀로그램 바탕 + 먹 로고) · k(먹 바탕 + 홀로그램 로고) · c(공식 색 바탕) */
  const LG = window.LOGOS || {};
  const lum = (hex) => { const n = parseInt(hex.slice(1), 16), f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(n >> 16) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255); };
  const hv = (k) => ['holo', 'holoB', 'holoC'][[...k].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 3];
  // 로고 도형. mode: brand(공식 색) · 단색(색 값)
  const mark = (key, mode, x, y, k) => { const L = LG[key]; if (!L) return '';
    const one = mode !== 'brand', f1 = one ? mode : L.c, f2 = one ? mode : L.c2;
    const bk = L.bk ? `<rect x="1.2" y="1.2" width="21.6" height="21.6" fill="${one ? 'none' : L.bk}"/>` : '';
    return `<g transform="translate(${x} ${y}) scale(${k})" stroke="none">${bk}<path d="${L.d}" fill="${f1}"/>${L.d2 ? `<path d="${L.d2}" fill="${f2}"/>` : ''}</g>`; };
  const logo = (key, shape, tone) => { const L = LG[key]; if (!L) return svg(10, 10, '');
    const base = tone === 'h' ? `url(#${hv(key)})` : tone === 'k' ? INK : tone === 'c' ? L.c : '#fff';
    const fg = tone === 'h' ? INK : tone === 'k' ? 'url(#holoL)' : tone === 'c' ? (lum(L.c) > 0.4 ? INK : '#fff') : 'brand';
    const edge = `stroke="${tone === 'k' ? `url(#${hv(key)})` : INK}" stroke-width="3.5"`;
    if (shape === 'cut') return svg(78, 78, mark(key, tone === 'w' || tone === 'c' ? 'brand' : tone === 'k' ? INK : `url(#holoL)`, 3, 3, 3));
    if (shape === 'hex') return svg(80, 92, `<polygon points="40,2 78,24 78,68 40,90 2,68 2,24" fill="${base}" ${edge}/>${mark(key, fg, 17.2, 23.2, 1.9)}`);
    if (shape === 'sq') return svg(80, 80, `<rect x="2" y="2" width="76" height="76" rx="18" fill="${base}" ${edge}/>${mark(key, fg, 16, 16, 2)}`);
    return svg(84, 84, `<circle cx="42" cy="42" r="39.5" fill="${base}" ${edge}/>${mark(key, fg, 18, 18, 2)}`); };
  // 파일 딱지: 모서리가 접힌 파일에 확장자 (상표가 아닌 글자). file:.py
  const FILEC = { '.py': '#ffd43b', '.kt': '#c9b3ff', '.ts': '#9cc4ff', '.go': '#8fe6f5', '.rs': '#ffb48f', '.js': '#f7df1e', '.swift': '#ffb09c', '.java': '#ffc48a' };
  const file = (ext, tone) => svg(64, 80, `<path d="M9 2h30l23 23v46a7 7 0 01-7 7H9a7 7 0 01-7-7V9a7 7 0 017-7z" fill="${tone === 'h' ? `url(#${hv(ext)})` : FILEC[ext] || '#fff'}" stroke="${INK}" stroke-width="3.5"/>
    <path d="M39 2v16a7 7 0 007 7h16z" fill="#fff" stroke="${INK}" stroke-width="3.5"/><path d="M12 40h22M12 48h14" stroke="${INK}" stroke-width="3" opacity=".28"/>
    <text x="32" y="69" text-anchor="middle" ${M} font-size="${ext.length > 4 ? 13 : ext.length > 3 ? 16 : 20}" font-weight="800" fill="${INK}">${ext}</text>`);
  // 글자 꼬리표: 고정폭 글자 한 줄. tag:git push
  const tag = (t, tone) => { const w = Math.round(t.length * 9.8 + 34);
    return svg(w, 42, `<rect x="2" y="2" width="${w - 4}" height="38" rx="${tone === 'k' ? 8 : 19}" fill="${tone === 'k' ? INK : tone === 'w' ? '#fff' : `url(#${hv(t)})`}" stroke="${tone === 'k' ? `url(#${hv(t)})` : INK}" stroke-width="3.5"/>
      <text x="${w / 2}" y="27.5" text-anchor="middle" ${M} font-size="15.5" font-weight="800" fill="${tone === 'k' ? 'url(#holoL)' : INK}">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`); };
  // 육각 글자 딱지: 로고 대신 확장자·기호를 적은 육각 스티커. hx:.py:h
  const hx = (t, tone) => svg(80, 92, `<polygon points="40,2 78,24 78,68 40,90 2,68 2,24" fill="${tone === 'k' ? INK : tone === 'w' ? '#fff' : `url(#${hv(t)})`}" stroke="${tone === 'k' ? `url(#${hv(t)})` : INK}" stroke-width="3.5"/>
    <text x="40" y="${t.length > 4 ? 51.5 : 54}" text-anchor="middle" ${M} font-size="${t.length > 5 ? 14 : t.length > 4 ? 16.5 : t.length > 3 ? 20 : 24}" font-weight="800" fill="${tone === 'k' ? 'url(#holoL)' : INK}">${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`);
  // 홀로그램 글자 딱지: 행사 종류. hw:밋업
  const hword = (t) => word(t).replace(/fill="#[0-9a-f]{3,6}"(?= stroke)/i, `fill="url(#${hv(t)})"`).replace(/(<text[^>]*fill=")#[0-9a-f]{3,6}/i, `$1${INK}`);

  // 칼선 테두리 + 그림자 필터. 그림의 불투명한 부분을 5px 넓혀 흰색으로 채우고, 그 모양대로 그림자를 깐다.
  // 홀로그램 판: 바탕색을 움직이는 무지개 그러데이션으로 바꾸고 흰 글자는 먹색으로 바꾼다. [바꿀 바탕색]
  const HOLO = { ticket: '#ffd84d', free: '#ff6b57', dday: '#ff8a1f', bolt: '#ffd84d', logo: `fill="${INK}" stroke`, code: '#0043ff', pin: '#e5383b', brace: '#19c39a', bubble: '#0043ff', bug: '#e5383b', db: '#19c39a', chip: '#8a6bff' };
  const holo = (name, c) => { let a = ART[name](c); const k = HOLO[name]; if (!k) return a;
    a = name === 'logo' ? a.replace(k, 'fill="url(#holo)" stroke') : a.replace(`fill="${k}"`, 'fill="url(#holo)"');
    return a.replace(/fill="#fff"/g, `fill="${INK}"`).replace(/stroke="#fff"/g, `stroke="${INK}"`); };
  // 세 가지 색 판(파랑·먹·흰색 + 형광 연두 포인트): 그림의 색을 정해진 색으로 바꿔 끼운다
  const TRI = { '#e5383b': '#0043ff', '#ff4d4f': '#0043ff', '#ff6b57': '#0043ff', '#ff8a1f': '#0043ff', '#ff5a1f': '#0043ff', '#19c39a': '#0043ff', '#ffd84d': '#d7ff3f', '#ffc94d': '#d7ff3f', '#e3913a': '#fff', '#5fe1ff': '#d7ff3f',
    '#cdd5df': '#fff', '#d6dce6': '#fff', '#c5ccd8': '#fff', '#fff8ee': '#fff', '#3fd97c': '#d7ff3f', '#ff5f57': '#fff', '#febc2e': '#fff', '#28c840': '#fff', '#053b2e': '#fff', '#1d2430': INK, '#0d1117': INK, '#8b949e': '#fff' };
  const tri = (a) => a.replace(/#[0-9a-f]{6}\b/gi, (m) => TRI[m.toLowerCase()] || m);
  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <path id="ringp" d="M54 54m-39 0a39 39 0 1 1 78 0a39 39 0 1 1 -78 0"/>
    <linearGradient id="holo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="150" y2="90" spreadMethod="reflect">
      <stop offset="0" stop-color="#ffb3d9"/><stop offset=".2" stop-color="#ffe9a8"/><stop offset=".4" stop-color="#b8ffd9"/><stop offset=".6" stop-color="#a8e1ff"/><stop offset=".8" stop-color="#d4b8ff"/><stop offset="1" stop-color="#ffb3d9"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="300 180" dur="7s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="holoB" gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="120" y2="0" spreadMethod="reflect">
      <stop offset="0" stop-color="#a8e1ff"/><stop offset=".2" stop-color="#d4b8ff"/><stop offset=".4" stop-color="#ffb3d9"/><stop offset=".6" stop-color="#ffe9a8"/><stop offset=".8" stop-color="#b8ffd9"/><stop offset="1" stop-color="#a8e1ff"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="240 -180" dur="9s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="holoC" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="60" y2="130" spreadMethod="reflect">
      <stop offset="0" stop-color="#b8ffd9"/><stop offset=".2" stop-color="#a8e1ff"/><stop offset=".4" stop-color="#d4b8ff"/><stop offset=".6" stop-color="#ffb3d9"/><stop offset=".8" stop-color="#ffe9a8"/><stop offset="1" stop-color="#b8ffd9"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="120 260" dur="8s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="holoL" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="26" y2="16" spreadMethod="reflect">
      <stop offset="0" stop-color="#ff8fd0"/><stop offset=".2" stop-color="#ffe07a"/><stop offset=".4" stop-color="#8dffc4"/><stop offset=".6" stop-color="#7fd6ff"/><stop offset=".8" stop-color="#c3a0ff"/><stop offset="1" stop-color="#ff8fd0"/>
      <animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="52 32" dur="6s" repeatCount="indefinite"/>
    </linearGradient>
    <filter id="diecut" x="-30%" y="-45%" width="160%" height="200%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="4.5" result="d"/><feGaussianBlur in="d" stdDeviation="1.3" result="b"/>
      <feComponentTransfer in="b" result="edge"><feFuncA type="linear" slope="16" intercept="-7"/></feComponentTransfer>
      <feOffset in="edge" dy="2" result="so"/><feGaussianBlur in="so" stdDeviation="2" result="sb"/><feFlood flood-color="#0d1226" flood-opacity=".2"/><feComposite in2="sb" operator="in" result="shadow"/>
      <feFlood flood-color="#fff"/><feComposite in2="edge" operator="in" result="border"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="diecut-up" x="-30%" y="-45%" width="160%" height="220%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="4.5" result="d"/><feGaussianBlur in="d" stdDeviation="1.3" result="b"/>
      <feComponentTransfer in="b" result="edge"><feFuncA type="linear" slope="16" intercept="-7"/></feComponentTransfer>
      <feOffset in="edge" dy="9" result="so"/><feGaussianBlur in="so" stdDeviation="6" result="sb"/><feFlood flood-color="#0d1226" flood-opacity=".34"/><feComposite in2="sb" operator="in" result="shadow"/>
      <feFlood flood-color="#fff"/><feComposite in2="edge" operator="in" result="border"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="kisscut" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d1"/><feGaussianBlur in="d1" stdDeviation="1.2" result="b1"/><feComponentTransfer in="b1" result="o"><feFuncA type="linear" slope="16" intercept="-7"/></feComponentTransfer>
      <feMorphology in="SourceAlpha" operator="dilate" radius="3.6" result="d2"/><feGaussianBlur in="d2" stdDeviation="1.2" result="b2"/><feComponentTransfer in="b2" result="i"><feFuncA type="linear" slope="16" intercept="-7"/></feComponentTransfer>
      <feComposite in="o" in2="i" operator="out" result="ring"/><feFlood flood-color="#aab2c0"/><feComposite in2="ring" operator="in" result="line"/>
      <feMerge><feMergeNode in="line"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter></defs></svg>`;

  const art = (name, c) => { const [h, a, b, t] = name.split(':');
    if (h === 'lg') return logo(a, b || 'disc', t || 'w');
    if (h === 'file') return file(a, b);
    if (h === 'tag') return tag(a, b);
    if (h === 'hx') return hx(a, b);
    if (h === 'hw') return hword(a);
    if (h === 'holo') return holo(a, c);
    if (h === 'tri') return tri(ART[a](c));
    return ART[name] ? ART[name](c) : word(name); };
  window.STICKERS = { art, names: Object.keys(ART), logos: Object.keys(LG), DEFS };
})();
