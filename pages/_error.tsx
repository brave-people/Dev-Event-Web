import Layout from 'component/common/layout';
import { NextPage, NextPageContext } from 'next';
import { ReactElement } from 'react';

interface Props {
  statusCode?: number;
}

const Error = ({ statusCode }: { statusCode: Props }) => {
  if (!statusCode) {
    return (
      <div className="error">
        <span>페이지를 불러오는 중에 문제가 발생했어요!</span>
      </div>
    );
  }

  return (
    <div className="error">
      <span>
        {statusCode} : {statusCode === 404 ? '페이지를 찾을 수 없습니다!' : '페이지를 불러오는 중에 문제가 발생했어요!'}
      </span>
    </div>
  );
};

Error.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
