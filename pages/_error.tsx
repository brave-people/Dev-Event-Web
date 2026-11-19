import { ReactElement } from 'react';
import classNames from 'classnames/bind';
import { NextPageContext } from 'next';
import Link from 'next/link';
import Layout from 'components/layout';
import style from 'styles/Error.module.scss';

const cn = classNames.bind(style);

interface Props {
  statusCode?: number;
}

const NOT_FOUND = '페이지를 찾을 수 없습니다';
const FAILED = '페이지를 불러오는 중에 문제가 발생했어요';

const Error = ({ statusCode }: Props) => {
  const message = statusCode === 404 ? NOT_FOUND : FAILED;

  return (
    <main className={cn('error')}>
      {statusCode ? (
        <b className={cn('code')} aria-hidden="true">
          {statusCode}
        </b>
      ) : null}
      <div className={cn('body')}>
        <h1 className={cn('title')}>
          {statusCode ? <span className={cn('sr')}>{statusCode} </span> : null}
          {message}
        </h1>
        <div className={cn('actions')}>
          <Link href="/events">
            <a className={cn('button', 'is-ink')}>행사 일정으로 가기</a>
          </Link>
          {statusCode === 404 ? null : (
            <button
              type="button"
              className={cn('button')}
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

Error.getLayout = function getLayout(page: ReactElement) {
  return <Layout subscribe={false}>{page}</Layout>;
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
