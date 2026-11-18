import dayjs from 'dayjs';

// 앞의 공백을 건너뛴 첫 글자. 없으면 ''
export const avatarInitial = (username: string | null | undefined): string => {
  const chars = Array.from((username || '').replace(/^\s+/, ''));
  return chars.length > 0 ? chars[0] : '';
};

// '2025년 03월 14일 가입'. 없거나 읽을 수 없으면 ''
export const joinedText = (registerDate: string | null | undefined): string => {
  if (!registerDate) return '';
  const date = dayjs(registerDate);
  return date.isValid() ? `${date.format('YYYY년 MM월 DD일')} 가입` : '';
};
