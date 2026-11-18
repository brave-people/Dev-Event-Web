import fs from 'fs';
import path from 'path';

const scss = fs.readFileSync(
  path.join(process.cwd(), 'styles/Theme.scss'),
  'utf8'
);
const block = (theme: 'light' | 'dark') => {
  const start = scss.indexOf(`html[data-theme='${theme}']`);
  return scss.slice(start, scss.indexOf('\n}', start));
};
const names = (s: string) =>
  Array.from(s.matchAll(/(--de-[a-z0-9-]+)\s*:/g), (m) => m[1]).sort();

const EXPECTED = [
  '--de-bg',
  '--de-surface',
  '--de-ink',
  '--de-sub',
  '--de-hint',
  '--de-faint',
  '--de-line',
  '--de-hover',
  '--de-blue',
  '--de-blue-fill',
  '--de-blue-soft',
  '--de-orange',
  '--de-orange-soft',
  '--de-red',
  '--de-navy',
  '--de-sun',
  '--de-sat',
  '--de-thumb-bg',
  '--de-thumb-fg',
  '--de-shadow',
  '--de-holo',
  '--de-holo-ink',
  '--de-prose-fg',
  '--de-prose-border',
  '--de-prose-th',
  '--de-prose-accent',
  '--de-prose-muted',
].sort();

describe('리디자인 색 변수', () => {
  it('밝은 화면에 정해진 변수가 모두 있다', () => {
    expect(names(block('light'))).toEqual(EXPECTED);
  });
  it('어두운 화면에도 같은 변수가 있다', () => {
    expect(names(block('dark'))).toEqual(EXPECTED);
  });
  it('밝은 화면의 바탕과 글자 값이 목업과 같다', () => {
    expect(block('light')).toMatch(/--de-bg:\s*#ffffff;/);
    expect(block('light')).toMatch(/--de-ink:\s*#17191e;/);
  });
});
