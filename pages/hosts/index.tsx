import HostCard from 'components/hosts/HostCard';
import HostListControls from 'components/hosts/HostListControls';
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
import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

const cn = classNames.bind(style);

const DEFAULT_SIZE = 30;

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

const HostsListPage = ({ fallbackData, params }: Props) => {
  const router = useRouter();
  const [search, setSearch] = useState(params.q ?? '');

  const { hostList } = useHostList(params, fallbackData);
  const data = hostList ?? fallbackData;
  const { hosts, meta } = data;

  useEffect(() => {
    setSearch(params.q ?? '');
  }, [params.q]);

  const pushQuery = (next: Partial<HostListParams>) => {
    const merged = { ...params, ...next };
    const query: Record<string, string> = {};
    if (merged.q) query.q = merged.q;
    if (merged.category && merged.category !== 'all') query.category = merged.category;
    if (merged.sort && merged.sort !== 'activity') query.sort = merged.sort;
    router.push({ pathname: '/hosts', query }, undefined, { shallow: false });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const trimmed = value.trim();
    if (trimmed === (params.q ?? '')) return;
    pushQuery({ q: trimmed || undefined });
  };

  return (
    <>
      <Head>
        <title>주최자 둘러보기 | Dev Event</title>
        <meta
          name="description"
          content={`개발자 행사를 꾸준히 여는 ${meta.total_hosts}명의 주최자를 만나보세요. 지금 진행중인 행사 ${meta.total_ongoing_events}건.`}
        />
      </Head>

      <section className={cn('pageHead')}>
        <h1 className={cn('title')}>주최자 둘러보기</h1>
        <p className={cn('sub')}>
          <span>
            개발자 행사를 꾸준히 여는 <b>{meta.total_hosts}명의 주최자</b>를 만나보세요.
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
          sort={params.sort ?? 'activity'}
          onSortChange={(sort) => pushQuery({ sort })}
          category={params.category ?? 'all'}
          onCategoryChange={(category) => pushQuery({ category })}
        />

        <div className={cn('grid')}>
          {hosts.length === 0 ? (
            <div className={cn('empty')}>
              조건에 맞는 주최자가 없어요. 검색어나 필터를 바꿔보세요.
            </div>
          ) : (
            hosts.map((host) => <HostCard key={host.id} host={host} />)
          )}
        </div>
      </main>

      <Letter />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const params: HostListParams = {
    category: parseCategory(query.category),
    sort: parseSort(query.sort),
    page: 0,
    size: DEFAULT_SIZE,
  };
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  if (q) params.q = q;
  const fallbackData = await getHostListApi('/front/v2/hosts', params);
  return { props: { fallbackData, params } };
};

HostsListPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default HostsListPage;
