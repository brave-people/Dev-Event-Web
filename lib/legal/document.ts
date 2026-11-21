// 이용약관·개인정보 처리방침 문서의 모양. 화면은 components/legal/LegalDocumentView.tsx가 그린다.

// 글 안의 링크. href는 '/'로 시작하는 서비스 주소, https:// 주소, mailto: 중 하나
export interface LegalLink {
  text: string;
  href: string;
}

// 그냥 글이거나, 글과 링크를 이어 붙인 것
export type Rich = string | (string | LegalLink)[];

export type LegalBlock =
  | { type: 'p'; text: Rich }
  | { type: 'ol'; items: Rich[] }
  | { type: 'ul'; items: Rich[] }
  | { type: 'table'; caption: string; head: string[]; rows: Rich[][] };

export interface LegalSection {
  id: string; // 목차 링크(#id)
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  path: '/terms' | '/privacy';
  description: string; // <meta name="description">
  effectiveDate: string; // 'YYYY-MM-DD'
  intro?: Rich;
  // 맨 위 "한눈에 보기" (처리방침만)
  summary?: { label: string; value: string }[];
  sections: LegalSection[];
}

// 운영 주체와 연락처. 이용약관·개인정보 처리방침의 문의·보호책임자 메일로 함께 쓴다.
export const OPERATOR = '용감한 친구들 with 남송리 삼번지';
export const CONTACT_EMAIL = 'devevent558@gmail.com';
export const CONTACT_LINK: LegalLink = {
  text: CONTACT_EMAIL,
  href: `mailto:${CONTACT_EMAIL}`,
};

export const TERMS_PATH = '/terms';
export const PRIVACY_PATH = '/privacy';

// '2026-11-20' → '2026년 11월 20일'
export const formatLegalDate = (date: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const [, y, m, d] = match;
  return `${Number(y)}년 ${Number(m)}월 ${Number(d)}일`;
};

const linksIn = (rich: Rich): LegalLink[] =>
  typeof rich === 'string'
    ? []
    : rich.filter((part): part is LegalLink => typeof part !== 'string');

// 문서 안 모든 링크 (테스트용)
export const collectLinks = (doc: LegalDocument): LegalLink[] => {
  const links: LegalLink[] = doc.intro ? linksIn(doc.intro) : [];
  for (const section of doc.sections) {
    for (const block of section.blocks) {
      if (block.type === 'p') links.push(...linksIn(block.text));
      if (block.type === 'ol' || block.type === 'ul') {
        block.items.forEach((item) => links.push(...linksIn(item)));
      }
      if (block.type === 'table') {
        block.rows.forEach((row) =>
          row.forEach((cell) => links.push(...linksIn(cell)))
        );
      }
    }
  }
  return links;
};
