import {
  collectLinks,
  CONTACT_EMAIL,
  formatLegalDate,
  LegalDocument,
  PRIVACY_PATH,
  TERMS_PATH,
} from 'lib/legal/document';
import { PRIVACY } from 'lib/legal/privacy';
import { TERMS } from 'lib/legal/terms';

const DOCS: [string, LegalDocument][] = [
  ['이용약관', TERMS],
  ['개인정보 처리방침', PRIVACY],
];

// 링크가 가리켜도 되는 서비스 안 주소
const INTERNAL_PATHS = ['/terms', '/privacy', '/myinfo'];

const textOf = (doc: LegalDocument): string => JSON.stringify(doc);

describe('시행일 표기', () => {
  it("'YYYY-MM-DD'를 한국어 날짜로 바꾼다", () => {
    expect(formatLegalDate('2026-11-20')).toBe('2026년 11월 20일');
    expect(formatLegalDate('2027-01-05')).toBe('2027년 1월 5일');
  });

  it('모양이 다르면 그대로 둔다', () => {
    expect(formatLegalDate('2026.11.20')).toBe('2026.11.20');
  });
});

describe.each(DOCS)('%s', (_, doc) => {
  it('주소가 상수와 같다', () => {
    expect([TERMS_PATH, PRIVACY_PATH]).toContain(doc.path);
  });

  it('목차 id가 겹치지 않고 주소에 쓸 수 있는 모양이다', () => {
    const ids = doc.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z][a-z0-9-]*$/));
  });

  it('시행일이 실제 날짜이고 본문의 시행일 문장과 같다', () => {
    expect(doc.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(doc.effectiveDate))).toBe(false);
    expect(textOf(doc)).toContain(`${formatLegalDate(doc.effectiveDate)}부터`);
  });

  it('링크는 서비스 안 주소·https·mailto 중 하나다', () => {
    const links = collectLinks(doc);
    links.forEach(({ href, text }) => {
      expect(text.length).toBeGreaterThan(0);
      if (href.startsWith('/')) {
        expect(INTERNAL_PATHS).toContain(href);
      } else if (href.startsWith('mailto:')) {
        expect(href).toBe(`mailto:${CONTACT_EMAIL}`);
      } else {
        expect(href).toMatch(/^https:\/\//);
      }
    });
  });

  it('표의 칸 수가 머리와 같다', () => {
    doc.sections.forEach((section) =>
      section.blocks.forEach((block) => {
        if (block.type !== 'table') return;
        block.rows.forEach((row) =>
          expect(row).toHaveLength(block.head.length)
        );
      })
    );
  });

  it('문의 메일을 알린다', () => {
    expect(collectLinks(doc).map((l) => l.href)).toContain(
      `mailto:${CONTACT_EMAIL}`
    );
  });
});

describe('개인정보 처리방침의 기재 사항 (개인정보 보호법 제30조, 시행령 제31조)', () => {
  // 법에 정한 항목이 빠지지 않게 목차를 고정해 둔다. 순서를 바꾸거나 더하면 여기도 고친다.
  it('필요한 항목을 모두 둔다', () => {
    expect(PRIVACY.sections.map((s) => s.id)).toEqual([
      'items', // 처리하는 개인정보의 항목
      'purposes', // 처리 목적
      'retention', // 처리·보유 기간, 파기 절차·방법
      'third-party', // 제3자 제공
      'outsourcing', // 처리 위탁, 국외 이전
      'cookies', // 자동 수집 장치의 설치·운영과 거부
      'rights', // 정보주체의 권리·의무와 행사 방법
      'safety', // 안전성 확보 조치
      'children', // 만 14세 미만 아동
      'officer', // 개인정보 보호책임자와 연락처
      'remedies', // 권익침해 구제 방법
      'changes', // 처리방침의 변경
    ]);
  });

  it('가입 창에서 받는 항목을 모두 적는다', () => {
    const items = JSON.stringify(
      PRIVACY.sections.find((s) => s.id === 'items')
    );
    ['이름', '아이디', '이메일', '비밀번호'].forEach((word) =>
      expect(items).toContain(word)
    );
  });

  it('개인정보를 받는 해외 업체를 모두 적는다', () => {
    const outsourcing = JSON.stringify(
      PRIVACY.sections.find((s) => s.id === 'outsourcing')
    );
    // Vercel(웹 호스팅), Google(GA·설문·앱 알림), Discord(서버의 운영팀 알림 DiscordWebhookService)
    ['Vercel Inc.', 'Google LLC', 'Discord Inc.'].forEach((name) =>
      expect(outsourcing).toContain(name)
    );
  });

  it('웹이 쓰는 쿠키와 저장소를 모두 적는다', () => {
    const cookies = JSON.stringify(
      PRIVACY.sections.find((s) => s.id === 'cookies')
    );
    // pages/index.tsx·pages/api/*, NoticeModal, context/window.tsx, _document(GA)
    [
      'access_token',
      'refresh_token',
      'dev-event-notice',
      'dev-event:theme',
      '_ga',
    ].forEach((name) => expect(cookies).toContain(name));
  });
});

describe('이용약관', () => {
  it('만 14세 이상만 가입할 수 있다고 적는다', () => {
    expect(textOf(TERMS)).toContain('만 14세 이상만');
  });

  it('운영팀의 고의·중과실 책임은 빼지 않는다 (약관규제법 제7조)', () => {
    expect(textOf(TERMS)).toContain('고의나 중대한 과실');
  });
});
