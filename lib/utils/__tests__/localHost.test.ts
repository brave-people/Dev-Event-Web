import { isLocalHost, LOCAL_HOST_PATTERN } from 'lib/utils/localHost';

describe('isLocalHost', () => {
  it.each([
    'localhost',
    'LOCALHOST',
    'app.localhost',
    '127.0.0.1',
    '127.1.2.3',
    '[::1]',
    '::1',
    '10.0.0.5',
    '192.168.0.10',
    '172.16.0.1',
    '172.31.255.255',
  ])('%s 는 로컬이다', (host) => {
    expect(isLocalHost(host)).toBe(true);
  });

  it.each([
    'dev-event.vercel.app',
    'example.com',
    'localhost.example.com',
    'mylocalhost',
    '127.0.0.1.nip.io',
    '172.15.0.1',
    '172.32.0.1',
    '11.0.0.1',
    '192.169.0.1',
    '8.8.8.8',
    '',
  ])('%s 는 로컬이 아니다', (host) => {
    expect(isLocalHost(host)).toBe(false);
  });

  it('인라인 스크립트에 넣을 source 로 다시 만들어도 같은 판단을 한다', () => {
    const rebuilt = new RegExp(LOCAL_HOST_PATTERN.source, 'i');
    expect(rebuilt.test('localhost')).toBe(true);
    expect(rebuilt.test('dev-event.vercel.app')).toBe(false);
  });
});
