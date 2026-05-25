import { Event } from 'model/event';
import {
  HostCategory,
  HostChip,
  HostClassification,
  HostDetail,
  HostEventsParams,
  HostEventsResponse,
  HostLink,
  HostListItem,
  HostListParams,
  HostListResponse,
  HostSort,
  HostSummary,
  HostTopic,
} from 'model/host';

const makeEvent = (
  id: string,
  organizer: string,
  title: string,
  start: string,
  end: string,
  tagNames: string[]
): Event => ({
  id,
  title,
  description: '',
  organizer,
  event_link: '#',
  cover_image_link: '',
  display_sequence: 0,
  event_time_type: 'DATE',
  start_day_week: '월',
  start_date_time: start,
  end_day_week: '월',
  end_date_time: end,
  tags: tagNames.map((name, i) => ({
    id: i + 1,
    tag_name: name,
    tag_color: '#6C6E7E',
    category: null,
  })),
  create_date_time: '',
  use_end_date_time_yn: 'Y',
  use_start_date_time_yn: 'Y',
});

interface HostFixture {
  list: HostListItem;
  detail: Omit<HostDetail, 'ongoing_events' | 'past_events'>;
  ongoing: Event[];
  past: Event[];
}

const DAANGN_ONGOING: Event[] = [
  makeEvent(
    'daangn-conf-2026',
    '당근',
    'DAANGN TECH CONFERENCE 2026 — 하이퍼로컬 인프라의 다음 10년',
    '2026-06-14T10:00:00',
    '2026-06-14T18:00:00',
    ['컨퍼런스', '오프라인', '코엑스']
  ),
  makeEvent(
    'daangn-webinar-rust',
    '당근',
    'Rust로 다시 쓰는 메시지 큐 — 당근 채팅 시스템 v3 회고',
    '2026-06-03T20:00:00',
    '2026-06-03T22:00:00',
    ['웨비나', '온라인', 'Rust']
  ),
];

const DAANGN_PAST: Event[] = [
  makeEvent(
    'daangn-sre-night',
    '당근',
    '당근 SRE 나잇 — 멀티 리전 장애 대응 실전',
    '2026-04-18T19:00:00',
    '2026-04-18T22:00:00',
    ['밋업', '오프라인', 'SRE']
  ),
  makeEvent(
    'daangn-hack-2026',
    '당근',
    '동네 해커톤 — 48시간 hyperlocal hack',
    '2026-03-22T10:00:00',
    '2026-03-24T18:00:00',
    ['해커톤', '오프라인']
  ),
  makeEvent(
    'daangn-kmp-talk',
    '당근',
    'Kotlin Multiplatform로 안드/iOS 50% 공유한 이야기',
    '2026-02-27T20:00:00',
    '2026-02-27T21:30:00',
    ['테크 토크', '온라인', 'Kotlin']
  ),
  makeEvent(
    'daangn-conf-2025',
    '당근',
    'DAANGN TECH CONFERENCE 2025',
    '2025-11-16T10:00:00',
    '2025-11-16T18:00:00',
    ['컨퍼런스', '오프라인']
  ),
  makeEvent(
    'daangn-ml-serving',
    '당근',
    'ML 서빙 latency 100ms 까지 — 추천 시스템 인프라 회고',
    '2025-09-04T20:00:00',
    '2025-09-04T21:30:00',
    ['웨비나', '온라인', 'ML']
  ),
];

const DAANGN: HostFixture = {
  list: {
    id: 1,
    host_name: '당근',
    logo_image_link: null,
    verified: true,
    classification: 'COMPANY',
    domain: '모바일·커뮤니티',
    ongoing_count: 2,
    total_count: 24,
    topics: ['백엔드', 'SRE', '머신러닝'],
  },
  detail: {
    id: 1,
    host_name: '당근',
    logo_image_link: null,
    banner_image_link: null,
    verified: true,
    classification: 'COMPANY',
    domain: '모바일 · 커뮤니티',
    meta_location: '서울 강남구',
    meta_history: '2015년부터 24건 주최',
    description:
      '당근(Daangn)은 동네 생활을 잇는 하이퍼로컬 플랫폼이에요. 엔지니어링 조직은 Kotlin · Rust · Kubernetes 기반의 대규모 트래픽 인프라와 ML 서빙 시스템을 운영하고, 그 경험을 정기적으로 외부 개발자 커뮤니티와 나누고 있어요. 매월 1회 사내 테크 토크를 공개 세션으로 운영하고, 분기마다 컨퍼런스/해커톤을 엽니다.',
    chips: [
      { label: '행사 진행중 2건', variant: 'live' },
      { label: '백엔드', variant: 'default' },
      { label: 'SRE', variant: 'default' },
      { label: '머신러닝', variant: 'default' },
      { label: '신청자 누적 8,400+명', variant: 'ghost' },
    ],
    topics: [
      { id: 11, name: '백엔드', count: 9 },
      { id: 12, name: 'SRE / 인프라', count: 7 },
      { id: 13, name: '머신러닝', count: 5 },
      { id: 14, name: '모바일 / Kotlin', count: 4 },
      { id: 15, name: '데이터 엔지니어링', count: 3 },
      { id: 16, name: 'Rust', count: 3 },
      { id: 17, name: '프론트엔드', count: 2 },
      { id: 18, name: 'DevRel', count: 2 },
    ],
    links: [
      {
        id: 101,
        type: 'HOMEPAGE',
        description: '공식 홈페이지',
        url: 'https://team.daangn.com',
        primary: true,
        display_order: 0,
      },
      {
        id: 102,
        type: 'BLOG',
        description: '기술 블로그',
        url: 'https://medium.com/daangn',
        primary: false,
        display_order: 1,
      },
      {
        id: 103,
        type: 'GITHUB',
        description: 'GitHub',
        url: 'https://github.com/daangn',
        primary: false,
        display_order: 2,
      },
      {
        id: 104,
        type: 'YOUTUBE',
        description: 'YouTube 채널',
        url: 'https://www.youtube.com/@daangntech',
        primary: false,
        display_order: 3,
      },
    ],
    summary: {
      total_events: 24,
      first_event_date: '2015-11-04',
      recent_delta: '+3건',
    },
  },
  ongoing: DAANGN_ONGOING,
  past: DAANGN_PAST,
};

const buildSimpleFixture = (params: {
  id: number;
  hostName: string;
  classification: HostClassification;
  domain: string;
  verified: boolean;
  ongoingCount: number;
  totalCount: number;
  shortDescription: string;
  topics: string[];
  firstEventDate: string;
  recentDelta: string;
  logoImageLink?: string | null;
}): HostFixture => {
  const ongoing: Event[] = Array.from({ length: params.ongoingCount }).map((_, i) =>
    makeEvent(
      `${params.id}-ongoing-${i + 1}`,
      params.hostName,
      `${params.hostName} 오픈 세션 vol.${i + 1}`,
      `2026-06-${String(5 + i * 3).padStart(2, '0')}T19:00:00`,
      `2026-06-${String(5 + i * 3).padStart(2, '0')}T21:00:00`,
      ['웨비나', '온라인', params.topics[0] ?? '개발']
    )
  );
  const past: Event[] = Array.from({ length: Math.min(3, params.totalCount) }).map(
    (_, i) =>
      makeEvent(
        `${params.id}-past-${i + 1}`,
        params.hostName,
        `${params.hostName} 개발자 행사 (지난 회차 ${i + 1})`,
        `2025-${String(11 - i * 2).padStart(2, '0')}-12T19:00:00`,
        `2025-${String(11 - i * 2).padStart(2, '0')}-12T22:00:00`,
        ['밋업', '오프라인']
      )
  );

  return {
    list: {
      id: params.id,
      host_name: params.hostName,
      logo_image_link: params.logoImageLink ?? null,
      verified: params.verified,
      classification: params.classification,
      domain: params.domain,
      ongoing_count: params.ongoingCount,
      total_count: params.totalCount,
      topics: params.topics.slice(0, 3),
    },
    detail: {
      id: params.id,
      host_name: params.hostName,
      logo_image_link: params.logoImageLink ?? null,
      banner_image_link: null,
      verified: params.verified,
      classification: params.classification,
      domain: params.domain,
      meta_location: null,
      meta_history: `누적 ${params.totalCount}건 주최`,
      description: params.shortDescription,
      chips: [
        ...(params.ongoingCount > 0
          ? ([{ label: `행사 진행중 ${params.ongoingCount}건`, variant: 'live' }] as HostChip[])
          : []),
        ...params.topics.slice(0, 3).map<HostChip>((t) => ({
          label: t,
          variant: 'default',
        })),
      ],
      topics: params.topics.map<HostTopic>((name, idx) => ({
        id: params.id * 100 + idx,
        name,
        count: Math.max(1, Math.floor(params.totalCount / (idx + 2))),
      })),
      links: [],
      summary: {
        total_events: params.totalCount,
        first_event_date: params.firstEventDate,
        recent_delta: params.recentDelta,
      },
    },
    ongoing,
    past,
  };
};

const FIXTURES: HostFixture[] = [
  DAANGN,
  buildSimpleFixture({
    id: 2,
    hostName: 'AWSKRUG',
    classification: 'COMMUNITY',
    domain: '클라우드',
    verified: true,
    ongoingCount: 5,
    totalCount: 187,
    shortDescription:
      'AWS Korea User Group. SRE, 컨테이너, 보안 등 다양한 소모임 밋업을 정기 운영해요.',
    topics: ['클라우드', 'DevOps', '컨테이너', 'SRE', '보안'],
    firstEventDate: '2014-03-01',
    recentDelta: '+12건',
  }),
  buildSimpleFixture({
    id: 3,
    hostName: '토스',
    classification: 'COMPANY',
    domain: '핀테크',
    verified: true,
    ongoingCount: 1,
    totalCount: 29,
    shortDescription:
      'SLASH 컨퍼런스를 매년 개최. 프론트엔드, 백엔드, 데이터 엔지니어링 등 전 영역의 기술 발표를 진행해요.',
    topics: ['프론트엔드', '백엔드', '데이터'],
    firstEventDate: '2019-05-12',
    recentDelta: '+2건',
    logoImageLink: 'https://static.toss.im/png-icons/securities/icn-sec-fill-3035.png',
  }),
  buildSimpleFixture({
    id: 4,
    hostName: '카카오',
    classification: 'COMPANY',
    domain: '플랫폼',
    verified: true,
    ongoingCount: 0,
    totalCount: 38,
    shortDescription:
      'if(kakao) 컨퍼런스를 비롯해 카카오 테크 부트캠프, 핀테크 밋업까지 다양한 행사를 운영합니다.',
    topics: ['AI/ML', '분산시스템', '모바일'],
    firstEventDate: '2018-09-04',
    recentDelta: '+0건',
  }),
  buildSimpleFixture({
    id: 5,
    hostName: '우아한형제들',
    classification: 'COMPANY',
    domain: '푸드테크',
    verified: true,
    ongoingCount: 1,
    totalCount: 27,
    shortDescription:
      '우아콘, 우아한테크코스, 우아한 세미나까지 — 교육과 컨퍼런스 양쪽에서 활발히 활동하는 주최.',
    topics: ['백엔드', 'DDD', 'QA'],
    firstEventDate: '2017-04-10',
    recentDelta: '+4건',
  }),
  buildSimpleFixture({
    id: 6,
    hostName: 'GDG Korea',
    classification: 'COMMUNITY',
    domain: '구글 개발자 그룹',
    verified: false,
    ongoingCount: 3,
    totalCount: 142,
    shortDescription:
      'Android, Web, Cloud, ML 등 Google 기술 전반의 정기 밋업과 DevFest를 운영하는 한국 커뮤니티.',
    topics: ['Android', 'Web', 'ML'],
    firstEventDate: '2012-06-23',
    recentDelta: '+8건',
  }),
  buildSimpleFixture({
    id: 7,
    hostName: 'NAVER',
    classification: 'COMPANY',
    domain: '플랫폼',
    verified: true,
    ongoingCount: 0,
    totalCount: 45,
    shortDescription:
      'DEVIEW 컨퍼런스를 비롯해 검색, 클로바 AI, 클라우드까지 전 분야의 기술 발표를 매년 진행합니다.',
    topics: ['검색', 'AI', '클라우드'],
    firstEventDate: '2010-11-18',
    recentDelta: '+0건',
  }),
  buildSimpleFixture({
    id: 8,
    hostName: 'DACON',
    classification: 'MEDIA',
    domain: '데이터 경진대회',
    verified: false,
    ongoingCount: 7,
    totalCount: 213,
    shortDescription:
      '월간 해커톤·머신러닝 경진대회를 운영. 실력 향상과 포트폴리오를 한 번에 챙길 수 있어요.',
    topics: ['해커톤', 'ML', '대회'],
    firstEventDate: '2017-01-02',
    recentDelta: '+15건',
  }),
  buildSimpleFixture({
    id: 9,
    hostName: '패스트캠퍼스',
    classification: 'EDUCATION',
    domain: '부트캠프',
    verified: false,
    ongoingCount: 4,
    totalCount: 89,
    shortDescription:
      '백엔드, AI, 데이터 분야의 무료 세미나와 채용 박람회를 정기적으로 운영하는 교육 플랫폼.',
    topics: ['AI', '백엔드', '데이터'],
    firstEventDate: '2016-08-15',
    recentDelta: '+6건',
  }),
];

const TOTAL_HOSTS = 342;
const TOTAL_ONGOING_EVENTS = 89;

const compareHosts = (a: HostListItem, b: HostListItem, sort: HostSort): number => {
  if (sort === 'activity') {
    const aScore = a.ongoing_count * 1000 + a.total_count;
    const bScore = b.ongoing_count * 1000 + b.total_count;
    return bScore - aScore;
  }
  if (sort === 'recent') {
    return b.ongoing_count - a.ongoing_count || b.id - a.id;
  }
  return a.host_name.localeCompare(b.host_name, 'ko');
};

const filterHost = (host: HostListItem, q: string | undefined, category: HostCategory): boolean => {
  if (q) {
    const needle = q.trim().toLowerCase();
    if (needle && !host.host_name.toLowerCase().includes(needle)) {
      return false;
    }
  }
  if (category === 'ongoing') {
    return host.ongoing_count > 0;
  }
  if (category !== 'all') {
    return host.classification === category;
  }
  return true;
};

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 80));

export const getMockHostList = async (
  params: HostListParams = {}
): Promise<HostListResponse> => {
  const { q, category = 'all', sort = 'activity', page = 0, size = 30 } = params;
  const filtered = FIXTURES.map((f) => f.list).filter((h) => filterHost(h, q, category));
  const sorted = [...filtered].sort((a, b) => compareHosts(a, b, sort));
  const start = page * size;
  const sliced = sorted.slice(start, start + size);
  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  return delay({
    meta: {
      total_hosts: TOTAL_HOSTS,
      total_ongoing_events: TOTAL_ONGOING_EVENTS,
      page,
      size,
      total_pages: totalPages,
    },
    hosts: sliced,
  });
};

const buildFallbackDetail = (hostId: number): HostFixture => {
  const hostName = `주최자 #${hostId}`;
  return buildSimpleFixture({
    id: hostId,
    hostName,
    classification: 'COMMUNITY',
    domain: '개발자 행사',
    verified: false,
    ongoingCount: 1,
    totalCount: 6,
    shortDescription: `${hostName}이(가) 주최한 개발자 행사 모음이에요. 진행중인 행사와 지난 행사를 한 번에 모아 봤어요.`,
    topics: ['백엔드', '프론트엔드', 'DevOps'],
    firstEventDate: '2022-04-01',
    recentDelta: '+1건',
  });
};

const findFixture = (hostId: number): HostFixture =>
  FIXTURES.find((f) => f.detail.id === hostId) ?? buildFallbackDetail(hostId);

export const getMockHostDetail = async (hostId: number): Promise<HostDetail> => {
  const fixture = findFixture(hostId);
  return delay({
    ...fixture.detail,
    ongoing_events: fixture.ongoing,
    past_events: fixture.past,
  });
};

export const getMockHostEvents = async (
  hostId: number,
  params: HostEventsParams = {}
): Promise<HostEventsResponse> => {
  const { status = 'all', page = 0, size = 20 } = params;
  const fixture = findFixture(hostId);
  let events: Event[] = [];
  if (status === 'ongoing') events = fixture.ongoing;
  else if (status === 'past') events = fixture.past;
  else events = [...fixture.ongoing, ...fixture.past];
  const start = page * size;
  const sliced = events.slice(start, start + size);
  return delay({
    host_id: hostId,
    page,
    size,
    total_pages: Math.max(1, Math.ceil(events.length / size)),
    total_elements: events.length,
    events: sliced,
  });
};
