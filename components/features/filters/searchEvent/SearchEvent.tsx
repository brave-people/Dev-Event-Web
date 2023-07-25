import React, { useContext, useState  } from "react";
import DefaultInput from "components/common/input/DefaultInput";
import classNames from "classnames/bind";
import style from './SearchEvent.module.scss'
import * as ga from 'lib/utils/gTag';
import { EventContext } from "context/event";

const cn = classNames.bind(style);

function SearchEvent() {
  const [input, setInput] = useState<string | undefined>(undefined)
  const { handleSearch } = useContext(EventContext);
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
      }
    } 
  };
  const updateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };
  return (
    <div className={cn('container')}>
      <DefaultInput
        label="행사 검색하기"
        size="large"
        icon="search"
        iconStyle="searchEvent"
        updateInput={updateInput}
        submitInput={submitInput}
      />
    </div>
  )  
}

export default SearchEvent;