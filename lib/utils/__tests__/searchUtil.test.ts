import { checkSearch, isEnterKey } from 'lib/utils/searchUtil';
import { Event } from 'model/event';

const event = (
  title: string,
  organizer: string,
  tagNames: string[] = []
): Event => ({
  id: '1',
  title,
  description: '',
  organizer,
  event_link: 'https://example.com',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'DATE',
  start_day_week: '수',
  start_date_time: '2026-10-15T19:00',
  end_day_week: '수',
  end_date_time: '2026-10-15T21:00',
  tags: tagNames.map((tag_name, index) => ({
    id: index + 1,
    tag_name,
    tag_color: '#0043FF',
    category: null,
  })),
  create_date_time: '2026-10-01T09:00',
  use_start_date_time_yn: 'Y',
  use_end_date_time_yn: 'Y',
});

const gudi = event('AWSKRUG 구로디지털 #gudi 소모임', 'AWSKRUG', ['클라우드']);

describe('checkSearch — 입력한 검색어', () => {
  it.each(['awskrug', 'AWSKRUG', 'AwsKrug'])(
    '대소문자와 상관없이 찾는다 (%s)',
    (kwd) => {
      expect(checkSearch(kwd, `/search?kwd=${kwd}`, gudi)).toBe(true);
    }
  );

  it('주최자 이름도 대소문자와 상관없이 찾는다', () => {
    const ktCloud = event(
      'AI 시대, 데이터센터 운영의 기준을 높이다',
      'kt cloud'
    );
    expect(checkSearch('KT Cloud', '/search?kwd=KT%20Cloud', ktCloud)).toBe(
      true
    );
  });

  it('태그 이름도 대소문자와 상관없이 찾는다', () => {
    const tagged = event('클라우드 밋업', '카카오', ['AI']);
    expect(checkSearch('ai', '/search?kwd=ai', tagged)).toBe(true);
  });

  it('앞뒤에 공백이 붙어 있어도 찾는다', () => {
    expect(checkSearch('  AWSKRUG  ', '/search', gudi)).toBe(true);
  });

  it('단어 사이 공백이 여러 칸이어도 찾는다', () => {
    expect(checkSearch('구로디지털   #gudi', '/search', gudi)).toBe(true);
  });

  it('띄어 쓴 제목을 붙여 써서 검색해도 찾는다', () => {
    const kakao = event('카카오 테크 캠퍼스 밋업', '카카오');
    expect(checkSearch('카카오테크', '/search', kakao)).toBe(true);
  });

  it('붙여 쓴 제목을 띄어 써서 검색해도 찾는다', () => {
    const agent = event('AI에이전트 해커톤', '모두의연구소');
    expect(checkSearch('AI 에이전트', '/search', agent)).toBe(true);
  });

  it('전각 영문으로 입력해도 찾는다', () => {
    expect(checkSearch('ＡＷＳＫＲＵＧ', '/search', gudi)).toBe(true);
  });

  it('자모가 분리된(NFD) 한글로 입력해도 찾는다', () => {
    expect(checkSearch('구로디지털'.normalize('NFD'), '/search', gudi)).toBe(
      true
    );
  });

  it('제목·주최·태그 어디에도 없으면 찾지 않는다', () => {
    expect(checkSearch('gcp', '/search?kwd=gcp', gudi)).toBe(false);
  });
});

describe('checkSearch — 주소의 검색어(kwd)', () => {
  it('주소로 들어온 검색어도 대소문자와 상관없이 찾는다', () => {
    expect(checkSearch(undefined, '/search?kwd=awskrug', gudi)).toBe(true);
  });

  it('검색어에 type 같은 필터 키 이름이 들어 있어도 검색어로 찾는다', () => {
    const ts = event('TypeScript 밋업', '타입스크립트 코리아');
    expect(checkSearch(undefined, '/search?kwd=typescript', ts)).toBe(true);
  });

  it('필터 키 이름이 들어 있는 검색어도 일치하지 않으면 찾지 않는다', () => {
    expect(checkSearch(undefined, '/search?kwd=typescript', gudi)).toBe(false);
  });

  it('% 가 인코딩되지 않은 주소에서도 오류 없이 찾는다', () => {
    const sale = event('얼리버드 50% 할인 컨퍼런스', '데브콘');
    expect(checkSearch(undefined, '/search?kwd=50%', sale)).toBe(true);
  });

  it('인코딩된 한글 검색어를 풀어서 찾는다', () => {
    expect(checkSearch(undefined, '/search?kwd=%EA%B5%AC%EB%A1%9C', gudi)).toBe(
      true
    );
  });

  it('/events 목록에서는 검색 조건을 적용하지 않는다', () => {
    expect(checkSearch(undefined, '/events', gudi)).toBe(true);
  });

  it('검색어 없이 필터만 있는 주소에서는 검색 조건을 적용하지 않는다', () => {
    expect(checkSearch(undefined, '/search?tag=AI', gudi)).toBe(true);
  });
});

describe('isEnterKey', () => {
  it.each([
    ['일반 Enter', { key: 'Enter', code: 'Enter' }],
    ['숫자 키패드 Enter', { key: 'Enter', code: 'NumpadEnter' }],
    ['code가 비어 있는 모바일 가상 키보드 Enter', { key: 'Enter', code: '' }],
    [
      '한글 조합 중 key가 Process로 오는 Enter',
      { key: 'Process', code: 'Enter' },
    ],
  ])('%s면 검색한다', (_, keyEvent) => {
    expect(isEnterKey(keyEvent)).toBe(true);
  });

  it.each([
    ['일반 문자 키', { key: 'a', code: 'KeyA' }],
    ['한글 조합 중 다른 키', { key: 'Process', code: 'KeyA' }],
  ])('%s면 검색하지 않는다', (_, keyEvent) => {
    expect(isEnterKey(keyEvent)).toBe(false);
  });
});
