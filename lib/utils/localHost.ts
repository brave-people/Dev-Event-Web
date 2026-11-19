// 개발 PC나 같은 망의 휴대폰에서 연 주소인가. 이런 곳에서 연 페이지는 운영 GA에 보내지 않는다.
// pages/_document.tsx 의 인라인 스크립트가 React보다 먼저 판단해야 해서 이 정규식의 source 를 그대로 쓴다.
export const LOCAL_HOST_PATTERN =
  /^(localhost|.+\.localhost|127(\.\d{1,3}){3}|\[?::1\]?|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2})$/i;

export const isLocalHost = (hostname: string): boolean =>
  LOCAL_HOST_PATTERN.test(hostname);
