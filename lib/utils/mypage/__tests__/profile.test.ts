import {
  avatarInitial,
  headerName,
  joinedText,
} from 'lib/utils/mypage/profile';

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

describe('headerName', () => {
  it('이름의 앞뒤 공백을 지운다', () => {
    expect(headerName('  김데브 ')).toBe('김데브');
  });

  it('이름이 없거나 공백뿐이면 "내 정보"', () => {
    expect(headerName(undefined)).toBe('내 정보');
    expect(headerName(null)).toBe('내 정보');
    expect(headerName('')).toBe('내 정보');
    expect(headerName('   ')).toBe('내 정보');
  });

  it('긴 이름은 자르지 않는다 (화면에서 줄임표로 줄인다)', () => {
    expect(headerName('아주아주긴닉네임을쓰는개발자')).toBe(
      '아주아주긴닉네임을쓰는개발자'
    );
  });
});
