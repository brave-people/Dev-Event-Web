import BasicInput from 'components/common/input/BasicInput';
import style from 'components/features/filters/searchEvent/SearchEvent.module.scss';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import { parseUrl } from 'lib/utils/UrlUtil';
import * as ga from 'lib/utils/gTag';
import { UrlContext } from 'types/Context';
import React, { useContext, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

type Props = {
  context: UrlContext | undefined;
};

function SearchEvent({ context }: Props) {
  const router = useRouter();
  const [input, setInput] = useState<string | undefined>(router.query.kwd?.toString() || undefined);
  const { jobGroupList, date, handleDate, handleSearch } = useContext(EventContext);
  const { modalState, handleModalState } = useContext(WindowContext);

  const submitInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (input?.length === 1 && event.code === 'Backspace') handleSearch(undefined);
    if (event.code == 'Enter') {
      if (input) {
        ga.event({
          action: 'web_event_키워드검색엔터클릭',
          event_category: 'web_event',
          event_label: '검색',
        });
        handleSearch(input);
        if (date !== undefined) handleDate(undefined);
        router.replace(`${parseUrl(`${router.asPath}`, 'kwd', input, jobGroupList)}`, undefined, { scroll: false });
      }
      if (window.innerWidth < 600) {
        handleModalState({
          currentModal: modalState.currentModal,
          prevModal: modalState.currentModal,
          type: false,
        });
      }
    }
  };

  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const initInput = () => {
    setInput('');
    handleModalState({
      currentModal: 0,
      prevModal: 0,
      type: true,
    });
  };
  useEffect(() => {
    if (context?.kwd === undefined) {
      handleSearch(undefined);
    } else {
      const decode = decodeURIComponent(context.kwd);
      handleSearch(decode);
    }
  }, []);
  return (
    <div
      onClick={() => {
        if (window.innerWidth < 600) {
          document.body.classList.add('body__no__scroll');
          handleModalState({
            currentModal: 1,
            prevModal: modalState.currentModal,
            type: true,
          });
        }
      }}
      className={cn('container')}
    >
      <BasicInput
        label="행사 검색하기"
        size="large"
        icon="search"
        iconStyle="searchEvent"
        updateInput={updateInput}
        submitInput={submitInput}
        initInput={initInput}
        input={input}
      />
    </div>
  );
}

export default SearchEvent;
