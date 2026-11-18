import { avatarInitial, joinedText } from 'lib/utils/mypage/profile';

describe('avatarInitial', () => {
  it('첫 글자', () => {
    expect(avatarInitial('김데브')).toBe('김');
    expect(avatarInitial('  dev')).toBe('d');
    expect(avatarInitial('😀abc')).toBe('😀');
  });
  it('없으면 빈 글자', () => {
    expect(avatarInitial('')).toBe('');
    expect(avatarInitial('   ')).toBe('');
    expect(avatarInitial(null)).toBe('');
    expect(avatarInitial(undefined)).toBe('');
  });
});

describe('joinedText', () => {
  it('가입일 글자', () => {
    expect(joinedText('2025-03-14T10:20:30')).toBe('2025년 03월 14일 가입');
    expect(joinedText('2025-03-14')).toBe('2025년 03월 14일 가입');
  });
  it('없거나 읽을 수 없으면 빈 글자', () => {
    expect(joinedText('')).toBe('');
    expect(joinedText(null)).toBe('');
    expect(joinedText(undefined)).toBe('');
    expect(joinedText('abc')).toBe('');
  });
});
