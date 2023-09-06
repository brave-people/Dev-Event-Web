import React, { useContext, useEffect, useState  } from "react";
import BasicInput from "components/common/input/BasicInput";
import classNames from "classnames/bind";
import style from 'components/features/filters/searchEvent/SearchEvent.module.scss'
import * as ga from 'lib/utils/gTag';
import { EventContext } from "context/event";
import { useRouter } from "next/router";
import { parseUrl } from "lib/utils/urlUtil";
import { UrlContext } from "types/Context";
import { WindowContext } from "context/window";

const cn = classNames.bind(style);

type Props = {
  context: UrlContext | undefined;
}

function SearchEvent( { context }: Props) {
  const [input, setInput] = useState<string | undefined>(undefined)
  const { jobGroupList, date, handleDate, handleSearch } = useContext(EventContext);
  const { modalState, handleModalState } = useContext(WindowContext)
  const router = useRouter();

  const submitInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (input?.length === 1 && (event.code === 'Backspace'))
      handleSearch(undefined)
    if (event.code == 'Enter') {
      if (input) {
        ga.event({
          action: 'web_event_키워드검색엔터클릭',
          event_category: 'web_event',
          event_label: '검색',
        });
        handleSearch(input);
        if (date !== undefined)
          handleDate(undefined);
        router.replace(`${parseUrl(`${router.asPath}`, 'kwd', input, jobGroupList)}`)
      }
      if (window.innerWidth < 600) {
        handleModalState({
          currentModal: modalState.currentModal,
          prevModal: modalState.currentModal,
          type: false
        })
      }
    }
  };

  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const initInput = () => {
    setInput("");
    handleModalState({
      currentModal: 0,
      prevModal: 0,
      type: true
    })
  }
  useEffect(() => {
    if (context?.kwd === undefined) {
      handleSearch(undefined)
    } else if (context.kwd !== undefined) {
      const decode = decodeURIComponent(context.kwd);
      handleSearch(decode)
    }
  }, [])
  return (
    <div
      onClick={() => {
        if (window.innerWidth < 600) {
          document.body.classList.add('body__no__scroll')
          handleModalState({
            currentModal: 1,
            prevModal: modalState.currentModal,
            type: true
          })
        }
      }} 
      className={cn('container')}>
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
  )  
}

export default SearchEvent;