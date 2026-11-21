import {
  CONTACT_LINK,
  formatLegalDate,
  LegalDocument,
  OPERATOR,
} from 'lib/legal/document';

// 데브이벤트 개인정보 처리방침 (「개인정보 보호법」 제30조, 시행령 제31조의 기재 사항).
// 적은 사실의 근거 (2026-11-20 확인):
// - 회원 항목·탈퇴 즉시 삭제·로그 60일·비밀번호 BCrypt: Dev-Event-Server의 User·FormRegisterDTO·UserServiceImpl·logback-spring.xml
// - 간편 로그인으로 받는 값: 같은 저장소의 *OAuth2DTO, 이메일이 없으면 임의 주소(RandomUtils)
// - 서버 위치: real-brave-people.p-e.kr → Oracle Cloud 공개 IP 대역표의 ap-seoul-1
// - 웹 요청: Vercel 응답의 x-vercel-id가 icn1::iad1 (함수는 미국 동부)
// - 운영 알림: DiscordWebhookService가 아이디 가입(UserServiceImpl)과 간편 로그인 성공(OAuth2SuccessHandler) 때마다 가입 방법·이름을 보냄(운영 서버만)
// - 쿠키: pages/index.tsx·pages/api/*(로그인), NoticeModal(90일), context/window.tsx(테마), _document(GA)
// 서버가 받는 정보·보내는 곳·보관 기간이 바뀌면 이 문서도 함께 고친다.
const EFFECTIVE_DATE = '2026-11-20';

export const PRIVACY: LegalDocument = {
  title: '개인정보 처리방침',
  path: '/privacy',
  description:
    '데브이벤트(Dev Event)가 어떤 개인정보를 왜 받고, 얼마나 보관하며, 어떻게 지키는지 알려 드립니다.',
  effectiveDate: EFFECTIVE_DATE,
  intro: `${OPERATOR}(이하 "운영팀")는 데브이벤트(Dev Event) 웹사이트와 앱(이하 "서비스")을 운영하면서 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고 관련 고충을 빠르게 처리하기 위해 이 개인정보 처리방침을 정해 공개합니다.`,
  summary: [
    {
      label: '받는 정보',
      value:
        '가입할 때 이름·아이디·이메일·비밀번호, 간편 로그인 때 로그인 서비스가 넘겨주는 이름(닉네임)·이메일·프로필 사진',
    },
    {
      label: '쓰는 곳',
      value: '회원 관리, 관심 행사 저장, 운영팀 알림, 방문 통계',
    },
    { label: '보관 기간', value: '탈퇴할 때까지 (탈퇴하면 바로 지움)' },
    { label: '제3자 제공', value: '하지 않음' },
  ],
  sections: [
    {
      id: 'items',
      title: '1. 처리하는 개인정보 항목과 수집 방법',
      blocks: [
        {
          type: 'p',
          text: '운영팀은 서비스에 필요한 최소한의 개인정보만 처리합니다.',
        },
        {
          type: 'table',
          caption: '처리하는 개인정보 항목과 수집 방법',
          head: ['구분', '항목', '수집 방법'],
          rows: [
            [
              '아이디로 가입',
              '이름, 아이디, 이메일, 비밀번호',
              '가입 화면에 직접 입력',
            ],
            [
              '간편 로그인 (카카오·네이버·Google·GitHub·Apple)',
              '로그인 서비스의 회원 식별값, 이름 또는 닉네임, 이메일, 프로필 사진',
              '처음 로그인할 때 해당 서비스에서 받음',
            ],
            [
              '서비스 이용',
              '관심 행사 목록, 가입 방법, 가입·수정 일시',
              '이용하면서 생김',
            ],
            [
              '행사 등록 요청',
              '이메일 주소 (요청 내용과 함께)',
              'Google 설문에 직접 입력',
            ],
            [
              '자동 수집',
              '로그인 유지 쿠키, 접속 기록(접속 일시, 방문 페이지, 브라우저·기기 종류, IP 주소), 로그인에 실패했을 때 입력한 아이디',
              '웹사이트에 접속하거나 이용할 때 자동으로 생김',
            ],
          ],
        },
        {
          type: 'ul',
          items: [
            '간편 로그인은 회원이 해당 서비스에서 제공을 허락한 정보만 받습니다. 이메일을 받지 못하면 운영팀이 로그인에만 쓰는 임의의 주소(…@dev-event.vercel.app)를 대신 만듭니다.',
            '주민등록번호 같은 고유식별정보와 민감정보는 받지 않습니다.',
          ],
        },
      ],
    },
    {
      id: 'purposes',
      title: '2. 처리 목적',
      blocks: [
        {
          type: 'ul',
          items: [
            '회원 가입과 관리: 회원 확인, 로그인 유지, 부정 이용 방지, 탈퇴 처리',
            '서비스 제공: 관심 행사 저장과 보여 주기, "내 정보" 화면',
            '행사 등록 요청 처리: 요청 확인과 회신',
            '문의 응대: 문의 확인과 답변',
            '운영팀 알림: 아이디 가입과 간편 로그인이 있을 때 운영팀 채팅방(Discord)에 알림',
            '서비스 개선: 방문·이용 통계 분석 (특정 개인을 알아보는 데 쓰지 않음)',
          ],
        },
        {
          type: 'p',
          text: '회원 가입·관리와 서비스 제공에 필요한 정보는 회원과 맺은 이용 계약을 이행하기 위해 처리합니다(「개인정보 보호법」 제15조 제1항 제4호). 운영팀은 개인정보를 광고나 마케팅에 쓰지 않으며, 목적이 바뀌면 미리 알리고 법에 따라 필요하면 따로 동의를 받습니다.',
        },
      ],
    },
    {
      id: 'retention',
      title: '3. 보유 기간과 파기',
      blocks: [
        {
          type: 'table',
          caption: '정보별 보유 기간',
          head: ['정보', '보유 기간'],
          rows: [
            [
              '회원 정보와 관심 행사 목록',
              '탈퇴할 때까지. 탈퇴하면 바로 지웁니다.',
            ],
            [
              '서버 기록 (로그인에 실패했을 때 입력한 아이디 등)',
              '60일 뒤 자동으로 지웁니다.',
            ],
            ['행사 등록 요청의 이메일 주소', '요청 처리를 마칠 때까지'],
            [
              '방문 통계 (Google Analytics)',
              'Google Analytics의 보관 기간 설정에 따름 (최대 14개월)',
            ],
            ['웹 요청 기록 (Vercel)', 'Vercel의 기록 보관 기간에 따름'],
            ['운영팀 알림 (Discord)', '운영팀이 알림 메시지를 지울 때까지'],
          ],
        },
        {
          type: 'p',
          text: '보유 기간이 끝나거나 처리 목적을 이루면 개인정보를 지체 없이 파기합니다. 전자 파일은 되살릴 수 없게 지우며, 개인정보를 종이로 출력해 두지 않습니다.',
        },
      ],
    },
    {
      id: 'third-party',
      title: '4. 제3자 제공',
      blocks: [
        {
          type: 'p',
          text: '운영팀은 개인정보를 제3자에게 제공하지 않습니다. 다만 법률에 특별한 규정이 있거나, 수사기관이 법령에 정한 절차에 따라 요구하는 경우에는 예외로 합니다.',
        },
      ],
    },
    {
      id: 'outsourcing',
      title: '5. 처리 위탁과 국외 이전',
      blocks: [
        {
          type: 'p',
          text: '운영팀은 서비스를 운영하려고 아래 업체에 개인정보 처리를 맡깁니다.',
        },
        {
          type: 'table',
          caption: '국내 처리 위탁',
          head: ['맡는 곳', '맡기는 일', '처리 위치'],
          rows: [
            [
              'Oracle (Oracle Cloud Infrastructure)',
              '서버 운영과 회원 정보 보관',
              '대한민국 (서울)',
            ],
          ],
        },
        {
          type: 'p',
          text: '아래 업체는 해외에 있는 서버에서 개인정보를 처리합니다.',
        },
        {
          type: 'table',
          caption: '국외 이전',
          head: [
            '받는 곳',
            '국가',
            '항목',
            '하는 일',
            '시기와 방법',
            '보유 기간',
          ],
          rows: [
            [
              'Vercel Inc.',
              '미국',
              '접속 기록(IP 주소, 브라우저·기기 종류, 방문 페이지), 로그인 유지 쿠키',
              '웹사이트 호스팅, 방문 통계(Vercel Web Analytics)',
              '웹사이트에 접속할 때마다 네트워크로 전송',
              'Vercel의 기록 보관 기간 (방문 통계의 방문 구분값은 24시간)',
            ],
            [
              'Google LLC',
              '미국',
              '쿠키 식별자, 방문 페이지, 브라우저·기기 종류, 대략적인 위치',
              '방문 통계 (Google Analytics)',
              '웹사이트에 접속할 때마다 네트워크로 전송',
              '최대 14개월',
            ],
            [
              'Google LLC',
              '미국',
              '이메일 주소와 요청 내용',
              '행사 등록 요청 받기 (Google 설문)',
              '설문을 제출할 때 네트워크로 전송',
              '요청 처리를 마칠 때까지',
            ],
            [
              'Google LLC',
              '미국',
              '앱 알림용 기기 식별값',
              '앱 알림 보내기 (Firebase Cloud Messaging)',
              '앱에서 알림을 받기로 할 때 네트워크로 전송',
              '앱을 지울 때까지',
            ],
            [
              'Discord Inc.',
              '미국',
              '이름 또는 닉네임, 가입 방법(아이디·카카오 등)',
              '운영팀 알림 (운영팀 채팅방)',
              '아이디로 가입할 때와 간편 로그인할 때마다 네트워크로 전송',
              '운영팀이 알림 메시지를 지울 때까지',
            ],
          ],
        },
        {
          type: 'ul',
          items: [
            'Vercel Inc. 연락처: privacy@vercel.com',
            'Google LLC 연락처: googlekrsupport@google.com',
            'Discord Inc. 연락처: privacy@discord.com',
          ],
        },
        {
          type: 'p',
          text: [
            '국외 이전을 원하지 않으면 운영팀(',
            CONTACT_LINK,
            ')에 알려 주세요. 다만 Vercel은 웹사이트를 보여 주는 데 꼭 필요해 거부하면 웹사이트를 쓸 수 없습니다. Google Analytics는 아래 "6. 쿠키" 항목의 방법으로 거부할 수 있고 거부해도 서비스는 그대로 쓸 수 있습니다. 앱 알림은 기기 설정에서 끌 수 있습니다. 운영팀 알림(Discord)을 원하지 않으면 운영팀에 알려 주세요. 그 회원에 관한 알림 메시지를 지웁니다.',
          ],
        },
      ],
    },
    {
      id: 'cookies',
      title: '6. 쿠키 등 자동 수집 장치',
      blocks: [
        {
          type: 'p',
          text: '서비스는 로그인 유지와 화면 설정, 방문 통계를 위해 쿠키와 브라우저 저장소를 씁니다.',
        },
        {
          type: 'table',
          caption: '서비스가 쓰는 쿠키와 저장소',
          head: ['이름', '하는 일', '보관 기간'],
          rows: [
            [
              'access_token, refresh_token',
              '로그인 유지 (꼭 필요한 쿠키)',
              '로그아웃할 때까지, 길어도 2개월',
            ],
            ['dev-event-notice', '공지 띠를 닫았는지 기억', '90일'],
            [
              'dev-event:theme (브라우저 저장소)',
              '밝게·어둡게 화면 설정 기억',
              '지울 때까지',
            ],
            ['_ga, _ga_* (Google Analytics)', '방문 통계', '최대 2년'],
          ],
        },
        {
          type: 'p',
          text: [
            'Vercel Web Analytics는 쿠키를 쓰지 않습니다. 쿠키는 브라우저 설정의 쿠키·사이트 데이터 메뉴에서 막거나 지울 수 있고, Google Analytics만 막으려면 ',
            {
              text: 'Google 애널리틱스 차단 부가기능',
              href: 'https://tools.google.com/dlpage/gaoptout?hl=ko',
            },
            '을 쓰면 됩니다. 로그인 쿠키를 막으면 로그인이 유지되지 않습니다.',
          ],
        },
      ],
    },
    {
      id: 'rights',
      title: '7. 정보주체의 권리와 행사 방법',
      blocks: [
        {
          type: 'ul',
          items: [
            '회원은 언제든 자신의 개인정보를 열람·정정·삭제하거나 처리를 멈추라고 요구할 수 있습니다.',
            [
              '열람: 로그인한 뒤 ',
              { text: '"내 정보"', href: '/myinfo' },
              ' 화면에서 이름, 이메일, 가입 방법, 가입일을 볼 수 있습니다.',
            ],
            '삭제: "내 정보" 화면에서 탈퇴하면 개인정보가 바로 지워집니다.',
            [
              '그 밖의 요구는 운영팀 이메일(',
              CONTACT_LINK,
              ')로 보내 주세요. 본인인지 확인한 뒤 10일 안에 처리하고 결과를 알려 드립니다.',
            ],
            '법정대리인이나 위임을 받은 사람을 통해서도 요구할 수 있으며, 이때는 위임장을 함께 보내 주세요.',
            '다른 법령에서 보관하도록 정한 정보는 삭제를 요구할 수 없고, 법에 정한 경우에는 열람이나 처리 정지 요구를 거절할 수 있습니다. 거절할 때는 그 이유를 알려 드립니다.',
          ],
        },
      ],
    },
    {
      id: 'safety',
      title: '8. 안전성 확보 조치',
      blocks: [
        {
          type: 'ul',
          items: [
            '비밀번호는 되돌릴 수 없는 방식(BCrypt)으로 암호화해 저장하므로 운영팀도 알 수 없습니다.',
            '브라우저·앱과 서버 사이의 통신은 HTTPS로 암호화합니다.',
            '로그인 쿠키는 스크립트가 읽을 수 없고(HttpOnly) 보안 연결에서만 전송되게(Secure) 설정합니다.',
            '회원 정보를 볼 수 있는 관리 화면은 관리자 권한이 있는 계정만 쓸 수 있습니다.',
          ],
        },
      ],
    },
    {
      id: 'children',
      title: '9. 만 14세 미만 아동',
      blocks: [
        {
          type: 'p',
          text: '서비스는 만 14세 미만 아동의 회원 가입을 받지 않습니다. 만 14세 미만 아동의 개인정보가 처리된 것을 알게 되면 바로 지웁니다.',
        },
      ],
    },
    {
      id: 'officer',
      title: '10. 개인정보 보호책임자',
      blocks: [
        {
          type: 'p',
          text: '개인정보 처리에 관한 문의, 불만, 피해 구제는 아래로 연락해 주세요. 빠르게 답변하고 처리하겠습니다.',
        },
        {
          type: 'ul',
          items: [
            '개인정보 보호책임자: 데브이벤트 운영팀',
            ['이메일: ', CONTACT_LINK],
          ],
        },
      ],
    },
    {
      id: 'remedies',
      title: '11. 권익침해 구제 방법',
      blocks: [
        {
          type: 'p',
          text: '개인정보 침해에 대한 신고나 상담이 필요하면 아래 기관에 문의할 수 있습니다.',
        },
        {
          type: 'ul',
          items: [
            [
              '개인정보분쟁조정위원회: 1833-6972, ',
              { text: 'www.kopico.go.kr', href: 'https://www.kopico.go.kr' },
            ],
            [
              '개인정보침해신고센터: 국번 없이 118, ',
              {
                text: 'privacy.kisa.or.kr',
                href: 'https://privacy.kisa.or.kr',
              },
            ],
            [
              '대검찰청: 국번 없이 1301, ',
              { text: 'www.spo.go.kr', href: 'https://www.spo.go.kr' },
            ],
            [
              '경찰청: 국번 없이 182, ',
              {
                text: 'ecrm.police.go.kr',
                href: 'https://ecrm.police.go.kr',
              },
            ],
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: '12. 처리방침의 변경',
      blocks: [
        {
          type: 'ul',
          items: [
            `이 개인정보 처리방침은 ${formatLegalDate(
              EFFECTIVE_DATE
            )}부터 적용합니다.`,
            '내용을 바꾸면 시행 7일 전부터 서비스에 공지합니다. 회원의 권리에 중요한 변경은 30일 전부터 공지합니다.',
          ],
        },
      ],
    },
  ],
};
