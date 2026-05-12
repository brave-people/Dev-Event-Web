import { tagColor, DEFAULT_TAG_COLOR } from '../tagColor';

describe('tagColor', () => {
  it('maps 컨퍼런스 to KTB Blue', () => {
    expect(tagColor(['컨퍼런스'])).toBe('#0043FF');
  });
  it('maps 웨비나 to Success green', () => {
    expect(tagColor(['웨비나'])).toBe('#08785E');
  });
  it('maps 해커톤 to Warning orange', () => {
    expect(tagColor(['해커톤'])).toBe('#B45209');
  });
  it('maps 네트워킹 to Violet', () => {
    expect(tagColor(['네트워킹'])).toBe('#7A0CFF');
  });
  it('returns default color when no tag matches', () => {
    expect(tagColor(['알수없는태그'])).toBe(DEFAULT_TAG_COLOR);
  });
  it('returns default color for empty tags', () => {
    expect(tagColor([])).toBe(DEFAULT_TAG_COLOR);
  });
  it('uses first matching tag when multiple tags', () => {
    expect(tagColor(['알수없음', '컨퍼런스', '웨비나'])).toBe('#0043FF');
  });
});
