/* 로그인 창 시안 열 가지 (2026-11-16). 2026-11-17 결정: 2. 홀로그램 머리띠(l2).
   공통 구조: 처음에는 카카오 로그인과 이메일 로그인만 보인다. "다른 방법으로 로그인"을 누르면 구글·네이버·깃허브가 그 자리에서 펼쳐진다.
   이메일 로그인을 누르면 같은 창 안에서 입력란으로 바뀐다(l10은 입력란이 처음부터 보인다).
   간편 로그인(카카오·Google·네이버·GitHub)은 처음 누르면 가입 양식 없이 바로 가입된다. 그래서 "회원가입"은 이메일 계정을 만들 때만 쓰는 말이고,
   창 제목은 "로그인 · 회원가입", 아래 링크는 "이메일로 가입"이다(2026-11-17).
   주소 옵션: ?login=l1…l10  ·  ?open=login(열린 채로 시작)  ·  ?lgmore=1(다른 방법이 펼쳐진 채로)  ·  ?lgview=email(입력란 화면) · ?lgview=join(이메일 가입 화면)
   html(variant, ctx) → 창 전체의 HTML. 열고 닫기와 펼치기는 app.js 가 처리한다. */
(function () {
  // 제공자 표시. 카카오 말풍선·구글 G·깃허브 마크는 지금 서비스(public/icon)의 것을 옮겼고, 네이버 N은 다시 그렸다. 실제 구현에서는 각 제공자가 배포하는 공식 파일을 쓴다.
  const I = {
    kakao: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12 3.2C6.6 3.2 2.2 6.65 2.2 10.9c0 2.74 1.82 5.14 4.55 6.5l-.93 3.44c-.09.33.28.6.57.41l3.98-2.67c.53.07 1.08.11 1.63.11 5.4 0 9.8-3.45 9.8-7.79S17.4 3.2 12 3.2z"/></svg>',
    google: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>',
    naver: '<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M13.56 10.7L6.15 0H0v20h6.44V9.3L13.85 20H20V0h-6.44z"/></svg>',
    github: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>',
    mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="M4.5 8l7.5 5 7.5-5"/></svg>',
    x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    down: '<svg class="lg-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg>',
  };
  const Q = new URLSearchParams(location.search), MORE = Q.get('lgmore') === '1', VIEW = ['email', 'join'].includes(Q.get('lgview')) ? Q.get('lgview') : 'main';

  // 버튼들. 문구와 색은 제공자 규정을 따른다(2026-11-16 확인): 카카오는 #FEE500 바탕·검정 말풍선·"카카오 로그인"·모서리 12px, Google은 테두리 없는 회색 판(Neutral: #F2F2F2 바탕, 2026-11-17에 흰 바탕·#747775 테두리에서 바꿈)·"Google 계정으로 로그인", 네이버는 녹색 바탕·흰 N
  const kakao = (label) => `<button class="lgb lgb--kakao" data-lg="go:카카오">${I.kakao}<span>${label || '카카오 로그인'}</span></button>`;
  const email = (label) => `<button class="lgb lgb--email" data-lg="email">${I.mail}<span>${label || '이메일로 로그인'}</span></button>`;
  const others = () => `<button class="lgb lgb--google" data-lg="go:Google">${I.google}<span>Google 계정으로 로그인</span></button>
    <button class="lgb lgb--naver" data-lg="go:네이버">${I.naver}<span>네이버 로그인</span></button>
    <button class="lgb lgb--github" data-lg="go:GitHub">${I.github}<span>GitHub 로그인</span></button>`;
  // "다른 방법으로 로그인": 누르면 아래 묶음이 펼쳐진다
  const more = (label, body) => `<button class="lgb lgb--more" data-lg="more" aria-expanded="${MORE}" aria-controls="lg-more"><span>${label || '다른 방법으로 로그인'}</span>${I.down}</button>
    <div class="lg-more" id="lg-more"${MORE ? '' : ' hidden'}>${body || others()}</div>`;
  // 간편 로그인은 처음 누르면 바로 가입되므로, 가입 링크는 이메일 계정을 만들 때만 필요하다
  const HINT = '처음이어도 간편 로그인 한 번이면 가입까지 끝나요.';
  const foot = (hint) => `<p class="lg-foot">${hint === false ? '' : `<span>${HINT}</span>`}이메일 계정이 필요하면 <button data-lg="signup">이메일로 가입</button></p>`;
  const footEmail = () => `<p class="lg-foot">이메일 계정이 없으신가요? <button data-lg="signup">이메일로 가입</button></p>`;
  const footJoin = () => `<p class="lg-foot">간편 로그인은 가입 없이 바로 시작할 수 있어요. <button data-lg="back">간편 로그인으로</button></p>`;
  const closeBtn = () => `<button class="lg-x" data-lg="close" aria-label="로그인 창 닫기">${I.x}</button>`;
  // 이메일 로그인 입력란. 입력값은 지금 서비스와 같다: 아이디·비밀번호 (2026-11-17, 스펙은 바꾸지 않는다)
  const form = (inline) => `<form class="lg-form" data-lg-form novalidate>
      <label><span>아이디</span><input name="id" type="text" autocomplete="username" placeholder="아이디 입력"></label>
      <label><span>비밀번호</span><input name="pw" type="password" autocomplete="current-password" placeholder="비밀번호 입력"></label>
      <button class="lgb lgb--go" type="submit">${inline ? '이메일로 로그인' : '로그인'}</button></form>`;
  // 이메일로 가입 입력란. 지금 서비스와 같다: 이름·아이디·이메일·비밀번호(6~15자)
  const joinForm = () => `<form class="lg-form" data-lg-form="join" novalidate>
      <label><span>이름</span><input name="name" type="text" autocomplete="name" placeholder="이름 입력"></label>
      <label><span>아이디</span><input name="id" type="text" autocomplete="username" placeholder="아이디 입력"></label>
      <label><span>이메일</span><input name="email" type="email" autocomplete="email" placeholder="이메일 입력"></label>
      <label><span>비밀번호</span><input name="pw" type="password" autocomplete="new-password" placeholder="비밀번호 입력 (6~15자)"></label>
      <button class="lgb lgb--go" type="submit">가입하기</button></form>`;
  const join = () => `<div class="lg-email" data-pane="join"><button class="lg-back" data-lg="back">${I.back}<span>다른 방법으로</span></button><h2 class="lg-h">이메일로 가입</h2>${joinForm()}${footJoin()}</div>`;
  // 세 화면(처음 · 이메일 로그인 · 이메일 가입)을 한 창에 넣고 data-view 로 바꿔 보여 준다
  const panes = (main, opt) => `<div class="lg-main">${main}</div>
    <div class="lg-email" data-pane="email"><button class="lg-back" data-lg="back">${I.back}<span>다른 방법으로</span></button><h2 class="lg-h">${(opt && opt.emailTitle) || '이메일로 로그인'}</h2>${form()}${footEmail()}</div>${join()}`;
  const std = (o) => `${kakao(o && o.kakao)}${email()}${more()}${foot(o && o.hint)}`;
  const wrap = (v, cls, inner, attr) => `<div class="lgo lgo--${v} ${cls || ''}" data-lg-root data-view="${VIEW}" ${attr || ''}>${inner}</div>`;
  const card = (v, inner, extra) => `<div class="lgc lgc--${v}" role="dialog" aria-modal="true" aria-label="로그인 · 회원가입" tabindex="-1">${extra || ''}${closeBtn()}${inner}</div>`;
  const SK = () => window.STICKERS || { art: () => '', DEFS: '' };
  const stk = (name, c, x, y, r, s, side) => `<span class="lg-stk" style="${side || 'left'}:${x}px;top:${y}px;--r:${r}deg;--s:${s}">${SK().art(name, c)}</span>`;

  const V = {
    // 1. 기본 카드: 참고로 주신 클래스101 로그인 창의 구조 그대로. 로고, 제목, 버튼 세 개, 글자 링크
    l1: (c) => wrap('l1', '', card('l1', panes(`<b class="lg-logo">DEV.EVENT</b><h2 class="lg-h">로그인</h2><p class="lg-p">관심 있는 행사를 담아 두고 한곳에서 관리해 보세요.</p>${std()}`))),

    // 2. 홀로그램 머리띠: 창 위쪽이 배너와 같은 어두운 홀로그램 스티커 띠
    l2: (c) => wrap('l2', '', card('l2', panes(`<h2 class="lg-h">로그인 · 회원가입</h2><p class="lg-p">${HINT}</p>${std({ hint: false })}`),
      `<div class="lg-band" aria-hidden="true">${SK().DEFS}${stk('holo:logo', c, 22, 30, -7, 0.86)}${stk('lg:js:hex:h', c, 178, 12, 9, 0.6)}${stk('laptop', c, 96, 80, 8, 0.6)}${stk('prompt', c, 118, 70, -6, 0.7, 'right')}${stk('lg:linux:hex:h', c, 66, 8, 8, 0.62, 'right')}${stk('lg:python:disc:w', c, 22, 78, -10, 0.52, 'right')}</div>`)),

    // 3. 검정 카드에 홀로그램 테: 창 전체가 검정이고 테두리만 무지개빛으로 흐른다 (배너의 '검정 스티커' 처리)
    l3: (c) => wrap('l3', '', card('l3', panes(`<b class="lg-logo">DEV.EVENT</b><h2 class="lg-h">로그인</h2><p class="lg-p">개발자 행사, 놓치지 않게 담아 두세요.</p>${std()}`))),

    // 4. 포스터 벽: 뒤에 실제 행사 포스터를 어둡게 깔았다 (클래스101: 뒤에 콘텐츠 썸네일 격자)
    l4: (c) => { const im = c.UP.filter((e) => e.img), t = Array.from({ length: 40 }, (_, i) => im[i % im.length]);
      return wrap('l4', '', `<div class="lg-wall" aria-hidden="true">${t.map((e) => `<i style="background-image:url('${c.esc(e.img)}')"></i>`).join('')}</div>` + card('l4', panes(`<b class="lg-logo">DEV.EVENT</b><h2 class="lg-h">로그인</h2><p class="lg-p">지금 접수 중인 행사 ${c.UP.length}건, 마음에 드는 것을 담아 두세요.</p>${std()}`))); },

    // 5. 터미널 창: 로그인 방법을 고르는 명령줄 화면
    l5: (c) => wrap('l5', '', card('l5', panes(`<div class="lg-term"><p><i>$</i> dev-event login</p><p class="ask"><i>?</i> 로그인 방법을 골라 주세요</p></div>
      <div class="lg-opts">${kakao()}${email()}${more('다른 방법 더 보기')}</div>${foot()}`, { emailTitle: '$ login --email' }),
      `<div class="lg-bar" aria-hidden="true"><i></i><i></i><i></i><span>login — dev-event</span></div>`)),

    // 6. 작은 창: 화면을 가리지 않고 로그인 버튼 바로 아래에 뜬다
    l6: (c) => wrap('l6', '', card('l6', panes(`<h2 class="lg-h">로그인</h2>${std()}`))),

    // 7. 옆 패널: PC에서는 오른쪽에서 밀려 나오고, 휴대폰에서는 아래에서 올라온다
    l7: (c) => wrap('l7', '', card('l7', panes(`<b class="lg-logo">DEV.EVENT</b><h2 class="lg-h">관심 있는 행사를<br>담아 두려면 로그인해 주세요</h2><p class="lg-p">담아 둔 행사는 "관심 행사"에서 한 번에 볼 수 있어요.</p>${std()}`), `<i class="lg-grip" aria-hidden="true"></i>`)),

    // 8. 전체 화면: 큰 인사말을 왼쪽에 붙여 쓴다
    l8: (c) => wrap('l8', '', card('l8', `<div class="lg-deco" aria-hidden="true">${SK().DEFS}${stk('holo:logo', c, 70, 150, -9, 1.1)}${stk('laptop', c, 150, 300, 7, 1)}${stk('lg:js:hex:h', c, 40, 400, -6, 0.9)}${stk('prompt', c, 60, 170, 6, 1.1, 'right')}${stk('lg:linux:hex:h', c, 150, 330, -8, 1, 'right')}${stk('holo:code', c, 50, 440, 9, 0.9, 'right')}</div><b class="lg-logo">DEV.EVENT</b><div class="lg-in">${panes(`<h2 class="lg-h">개발자 행사,<br>놓치지 않게 담아 두세요</h2><p class="lg-p">로그인하면 관심 행사를 담고 한곳에서 관리할 수 있어요.</p>${std()}`)}</div>`)),

    // 9. 아이콘 줄: 다른 방법은 큰 버튼 세 개가 아니라 둥근 아이콘 세 개로 펼쳐진다
    l9: (c) => wrap('l9', '', card('l9', panes(`<b class="lg-logo">DEV.EVENT</b><h2 class="lg-h">로그인</h2><p class="lg-p">관심 있는 행사를 담아 두고 한곳에서 관리해 보세요.</p>${kakao()}${email()}
      ${more('다른 방법으로 로그인', `<div class="lg-ics"><button class="lg-ic lg-ic--google" data-lg="go:Google" aria-label="Google 계정으로 로그인">${I.google}<span>Google</span></button><button class="lg-ic lg-ic--naver" data-lg="go:네이버" aria-label="네이버 로그인">${I.naver}<span>네이버</span></button><button class="lg-ic lg-ic--github" data-lg="go:GitHub" aria-label="GitHub 로그인">${I.github}<span>GitHub</span></button></div>`)}${foot()}`))),

    // 10. 바로 입력: 이메일·비밀번호 입력란이 처음부터 보이고, 그 위에 카카오 버튼
    l10: (c) => wrap('l10', '', card('l10', `<div class="lg-main"><b class="lg-logo">DEV.EVENT</b><h2 class="lg-h">로그인</h2>${kakao()}<div class="lg-or"><span>또는 이메일로</span></div>${form(true)}${more()}${foot()}</div>${join()}`)).replace('data-view="email"', 'data-view="main"'),
  };
  const NAMES = { l1: '기본 카드', l2: '홀로그램 머리띠', l3: '검정 카드에 홀로그램 테', l4: '포스터 벽', l5: '터미널 창', l6: '작은 창', l7: '옆 패널', l8: '전체 화면', l9: '아이콘 줄', l10: '바로 입력' };
  window.LOGIN = { html: (v, c) => (V[v] || V.l1)(c), ids: Object.keys(V), names: NAMES };
})();
