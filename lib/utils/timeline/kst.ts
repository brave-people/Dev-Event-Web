// 한국 시간 벽시계 계산. Date.UTC / getUTC* 만 쓴다 (실행 환경의 시간대와 무관).
// "벽시계 ms"는 문자열의 연·월·일·시·분을 Date.UTC(...)에 그대로 넣은 값이다.

export const DAY_MS = 86400000;
const KST_OFFSET_MS = 9 * 3600000;

export const DOW: readonly string[] = [
  '일',
  '월',
  '화',
  '수',
  '목',
  '금',
  '토',
];

const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const toKstNaive = (epochMs: number): string => {
  const d = new Date(epochMs + KST_OFFSET_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate()
  )}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};

const NAIVE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/;

export const parseNaive = (value: string): number => {
  const m = NAIVE_PATTERN.exec(value || '');
  if (!m) return NaN;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0);
};

export const dayKey = (naiveMs: number): string => {
  const d = new Date(naiveMs);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate()
  )}`;
};

export const keyToMs = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export const addDays = (key: string, days: number): string =>
  dayKey(keyToMs(key) + days * DAY_MS);

export const diffDays = (a: string, b: string): number =>
  Math.round((keyToMs(a) - keyToMs(b)) / DAY_MS);

export const weekdayOf = (key: string): number =>
  new Date(keyToMs(key)).getUTCDay();

export const formatMd = (key: string): string => {
  const d = new Date(keyToMs(key));
  return `${d.getUTCMonth() + 1}.${d.getUTCDate()}`;
};

export const formatMdw = (key: string): string =>
  `${formatMd(key)}(${DOW[weekdayOf(key)]})`;

export const formatHm = (naiveMs: number): string => {
  const d = new Date(naiveMs);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};
