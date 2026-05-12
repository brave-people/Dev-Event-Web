export const DEFAULT_TAG_COLOR = '#525463';

const COLOR_MAP: Array<{ keywords: string[]; color: string }> = [
  { keywords: ['컨퍼런스', 'conference', 'conf'],         color: '#0043FF' },
  { keywords: ['웨비나', '세미나', 'webinar', 'seminar'], color: '#08785E' },
  { keywords: ['해커톤', '공모전', 'hackathon'],           color: '#B45209' },
  { keywords: ['네트워킹', '밋업', 'meetup'],              color: '#7A0CFF' },
];

export function tagColor(tagNames: string[]): string {
  for (const tagName of tagNames) {
    const lower = tagName.toLowerCase();
    const match = COLOR_MAP.find(({ keywords }) =>
      keywords.some((k) => lower.includes(k.toLowerCase()))
    );
    if (match) return match.color;
  }
  return DEFAULT_TAG_COLOR;
}
