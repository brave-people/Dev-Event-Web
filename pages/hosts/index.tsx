import HostCard from 'components/hosts/HostCard';
import HostListControls from 'components/hosts/HostListControls';
import HostPagination from 'components/hosts/HostPagination';
import Letter from 'components/features/letter/Letter';
import Layout from 'components/layout';
import { getHostListApi } from 'lib/api/host';
import { useHostList } from 'lib/hooks/useSWR';
import { HostCategory, HostListParams, HostListResponse, HostSort } from 'model/host';
import style from 'styles/HostListPage.module.scss';
import classNames from 'classnames/bind';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

const cn = classNames.bind(style);

const DEFAULT_SIZE = 30;
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://dev-event.vercel.app';
const PAGE_TITLE = '주최자 둘러보기 | Dev Event';
const SEARCH_DEBOUNCE_MS = 350;

type Props = {
  fallbackData: HostListResponse;
  params: HostListParams;
};

const parseSort = (raw: unknown): HostSort => {
  if (raw === 'recent' || raw === 'name') return raw;
  return 'activity';
};

const parseCategory = (raw: unknown): HostCategory => {
  const allowed: HostCategory[] = [
    'all',
    'ongoing',
    'COMPANY',
    'COMMUNITY',
    'ACADEMIC',
    'GOVERNMENT',
    'EDUCATION',
    'MEDIA',
  ];
  return (allowed as readonly unknown[]).includes(raw) ? (raw as HostCategory) : 'all';
};

/** page / size 는 음수·NaN 을 0 또는 기본값으로 클램프한다. */
const parsePage = (raw: unknown): number => {
  const parsed = typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isInteger(parsed) || parsed < 0) return 0;
  return parsed;
};

const parseSize = (raw: unknown): number => {
  const parsed = typeof raw === 'string' ? Number(raw) : NaN;
  if (!Number.isInteger(parsed) || parsed < 1) return DEFAULT_SIZE;
  return Math.min(parsed, 60);
};

const HostsListPage = ({ fallbackData, params }: Props) => {
  const router = useRouter();
  const [search, setSearch] = useState(params.q ?? '');

  // 디바운스 대기 중에는 URL 값으로 입력창을 되돌리지 않는다(입력 되돌림 경쟁 제거).
  const pendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { hostList, isError, isValidating } = useHostList(params, fallbackData);
  const data = hostList ?? fallbackData;
  const { hosts, meta } = data;

  const hasFilter = Boolean(params.q) || (params.category ?? 'all') !== 'all';

  // 주최자에는 기업·커뮤니티·학회가 섞여 있어 사람 단위인 '명' 대신 '곳'으로 센다
  const pageDescription = `개발자 행사를 꾸준히 여는 주최자 ${meta.total_hosts}곳을 만나보세요. 지금 진행중인 행사 ${meta.total_ongoing_events}건.`;

  useEffect(() => {
    if (pendingRef.current) return;
    setSearch(params.q ?? '');
  }, [params.q]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const pushQuery = (next: Partial<HostListParams>, keepPage = false) => {
    const merged = { ...params, ...next };
    const query: Record<string, string> = {};
    if (merged.q) query.q = merged.q;
    if (merged.category && merged.category !== 'all') query.category = merged.category;
    if (merged.sort && merged.sort !== 'activity') query.sort = merged.sort;
    // 필터가 바뀌면 항상 첫 페이지로 되돌린다.
    const page = keepPage ? merged.page ?? 0 : 0;
    if (page > 0) query.page = String(page);
    if (merged.size && merged.size !== DEFAULT_SIZE) query.size = String(merged.size);
    router.push({ pathname: '/hosts', query }, undefined, { shallow: false });
  };

  const commitSearch = (value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingRef.current = false;
    const trimmed = value.trim();
    if (trimmed === (params.q ?? '')) return;
    pushQuery({ q: trimmed || undefined });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    pendingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commitSearch(value), SEARCH_DEBOUNCE_MS);
  };

  const handlePageChange = (page: number) => {
    pushQuery({ page }, true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`${SITE_URL}/hosts`} />
        <meta property="og:image" content={`${SITE_URL}/default/og_image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={`${SITE_URL}/default/og_image.png`} />
      </Head>

      <section className={cn('pageHead')}>
        <h1 className={cn('title')}>주최자 둘러보기</h1>
        <p className={cn('sub')}>
          <span>
            개발자 행사를 꾸준히 여는 <b>주최자 {meta.total_hosts}곳</b>을 만나보세요.
          </span>
          <span className={cn('sub__dot')}>•</span>
          <span>
            지금 진행중인 행사 <b>{meta.total_ongoing_events}건</b>
          </span>
        </p>
      </section>

      <main className={cn('body')}>
        <HostListControls
          search={search}
          onSearchChange={handleSearchChange}
          onSearchSubmit={commitSearch}
          sort={params.sort ?? 'activity'}
          onSortChange={(sort) => pushQuery({ sort })}
          category={params.category ?? 'all'}
          onCategoryChange={(category) => pushQuery({ category })}
        />

        {isError && (
          <p className={cn('staleBanner')} role="status">
            최신 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        {hasFilter && (
          <p className={cn('resultCount')}>
            검색 결과 <b>{meta.filtered_hosts ?? hosts.length}명</b>
          </p>
        )}

        <div className={cn('grid', { grid__loading: isValidating })}>
          {hosts.length === 0 ? (
            <div className={cn('empty')}>
              조건에 맞는 주최자가 없어요. 검색어나 필터를 바꿔보세요.
            </div>
          ) : (
            hosts.map((host) => <HostCard key={host.id} host={host} />)
          )}
        </div>

        <HostPagination
          page={meta.page}
          totalPages={meta.total_pages}
          onChange={handlePageChange}
        />
      </main>

      <Letter />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const params: HostListParams = {
    category: parseCategory(query.category),
    sort: parseSort(query.sort),
    page: parsePage(query.page),
    size: parseSize(query.size),
  };
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q) params.q = q;

  try {
    const fallbackData = await getHostListApi('/front/v2/hosts', params);
    return { props: { fallbackData, params } };
  } catch (error: any) {
    // 서버가 죽어 있어도 500 대신 빈 상태 UI가 뜨도록 폴백한다.
    console.error('[hosts] 주최자 목록 조회 실패', error?.status ?? error);
    return {
      props: {
        fallbackData: {
          meta: {
            total_hosts: 0,
            total_ongoing_events: 0,
            page: 0,
            size: params.size ?? DEFAULT_SIZE,
            total_pages: 0,
            filtered_hosts: 0,
          },
          hosts: [],
        },
        params,
      },
    };
  }
};

HostsListPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default HostsListPage;
