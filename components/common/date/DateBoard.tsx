import React, { useContext, useEffect, useRef, useState, Dispatch, SetStateAction } from "react";
import style from 'components/common/date/DateBoard.module.scss'
import classNames from "classnames/bind";
import { LeftArrowIcon, RightArrowIcon } from "components/icons";
import { useOnClickOutside } from "lib/hooks/useOnClickOutside";
import { EventContext } from "context/event";
import { getMonth } from "lib/utils/dateUtil";
import DateElement from "./DateElement";
import { useRouter } from "next/router";
import { WindowContext } from "context/window";

const cn = classNames.bind(style);

type Props = {
  options: string[];
}

function DateBoard({ options }: Props) {
  const router = useRouter();
  const initYear = router.asPath.includes('calender') ? router.asPath.slice(15, 19) : new Date().getFullYear().toString();
  const initMonth = router.asPath.includes('calender') ? router.asPath.slice(26, 28) : getMonth();
  const [dateElement, setDateElement] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFirstEl, setIsFirstEl] = useState<boolean>(false);
  const [isLastEl, setIsLastEl] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<string>(initYear);
  const [currentMonth, setCurrentMonth] = useState<string>(initMonth);
  const { 
    date, handleDate, handleSearch, handleLocation, handleEventType, handleCoast, initJobGroupList, handleUrl
  } = useContext(EventContext);  
  const { modalState, handleModalState } = useContext(WindowContext);
  const outSideRef = useRef(null);

  const handleClose = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const handleRemoveContext = () => {
    handleSearch(undefined);
    handleCoast(undefined);
    handleLocation(undefined);
    handleEventType(undefined);
    initJobGroupList();
  }

  const handleIsOpen = (isOpen: boolean) => {
    setIsOpen(isOpen);
  }

  const handleClickDropdown = () => {
    const windowX = window.innerWidth;

    if (windowX < 600 && modalState.currentModal !== 3) {
      setDateElement(true);
      document.body.classList.add('body__no__scroll')
      handleModalState({
        currentModal: 3,
        prevModal: modalState.currentModal,
        type: false,
      })
    } else if (windowX >= 600) {
      setIsOpen(!isOpen);
    }
  };

  const handleArrowBtn = (dateArg: string | undefined, type: string) => {
    if (type === "prev" && dateArg === undefined) {
      handleDate(`${currentYear}년 ${currentMonth}월`);
      setIsLastEl(false);
      router.push(`/calender?year=${currentYear}&month=${currentMonth}`);
      return ;
    }
    if (dateArg !== undefined) {
      const current = options.indexOf(dateArg);
      if (type === 'prev') {
        if (current !== 1) {
          const newYear = options[current - 1].slice(0, 4);
          const newMonth = options[current - 1].slice(6, 8);
          handleDate(options[current - 1]);
          setCurrentYear(newYear);
          setCurrentMonth(newMonth);
          router.push(`/calender?year=${newYear}&month=${newMonth}`);
        }
        if (current - 1 === 1)
          setIsFirstEl(true);
        else
          setIsFirstEl(false);
        setIsLastEl(false);
      } else if (type === 'next') {
        if (options[current] === `${new Date().getFullYear().toString()}년 ${getMonth()}월`) {
          router.push('/events');
          handleDate(undefined);
          setIsLastEl(true);
        } else {
          const newYear = options[current + 1].slice(0, 4);
          const newMonth = options[current + 1].slice(6, 8);
          handleDate(options[current + 1]);
          setCurrentYear(newYear);
          setCurrentMonth(newMonth);
          setIsFirstEl(false);
          router.push(`/calender?year=${newYear}&month=${newMonth}`);
        }
      }
    }
  }

  const reflactUrl = (urls: string) => {
    const windowX = window.innerWidth;
    handleUrl(urls);
    if (windowX < 600)
      return ;
    router.push(urls)
  }

  useOnClickOutside({ ref: outSideRef, handler: handleClose, mouseEvent: 'click' });
  
  useEffect(() => {
    if (date === undefined) {
      if (router.asPath.includes('calender') && isLastEl === false) {
        const initDate = `${router.asPath.slice(15, 19)}년 ${router.asPath.slice(26, 28)}월`
        handleDate(initDate);
      }
    } 
    
    if (date !== undefined) {
      if (router.asPath.includes('calender')) {
        const initDate = `${date.slice(0, 4)}년 ${date.slice(6, 8)}월`
        handleDate(initDate);
        setCurrentYear(date.slice(0, 4));
        setCurrentMonth(date.slice(6, 8));
      }
    }
  }, [date])

  return (
    <div className={cn('container', isOpen && 'container__focus')} ref={outSideRef}>
      <div
        className={cn('key', 'key--left', `${isLastEl ? 'key--disactive' : 'key--active'}`)}
        onClick={() => {
          handleArrowBtn(date, 'prev');
          handleRemoveContext();
        }}>
        <LeftArrowIcon
          color="#313234"
        />
      </div>
      <div className={cn('dropdown')}>
        <div className={cn('dropdown__header')} onClick={handleClickDropdown}>
          {<span>{date === undefined ? "전체" :`${currentYear}년 ${currentMonth}월`}</span>}
        </div>
        {isOpen && (
          <div className={cn('dropdown__list')}>
            <div className={cn("dropdown__list__year")}>
              <div
                className={cn(`${parseInt(currentYear) === parseInt(initYear) - 1 ? "unvalid__key" : "year__key"}`)}
                onClick={() => {
                  if (parseInt(currentYear) !== parseInt(initYear) - 1) {
                    const prev = parseInt(currentYear) - 1;
                    setCurrentYear(prev.toString());
                  }
                }}>
                <LeftArrowIcon
                  color="#313234"
                />
              </div>
              <div
                className={cn('year__text')}>
                {currentYear}
              </div>
              <div
                className={cn(`${parseInt(currentYear) === parseInt(initYear) ? "unvalid__key" : "year__key"}`)}
                onClick={() => {
                  if (parseInt(currentYear) === parseInt(initYear)) 
                    return ;
                  else {
                    const next = parseInt(currentYear) + 1;
                    setCurrentYear(next.toString());
                  }
                }}>
                <RightArrowIcon
                  color="#313234"
                />
              </div>
            </div>
            <DateElement
              options={options}
              currentYear={currentYear}
              setIsFirst={setIsFirstEl}
              setIsLast={setIsLastEl}
              reflactUrl={reflactUrl}
              handleIsOpen={handleIsOpen}
              handleRemoveContext={handleRemoveContext}
            />
          </div>
        )}
      </div>
      <div 
        className={cn('key--right', `${date === undefined ? 'key--disactive' : 'key--active'}`)}
        onClick={() => {
          if (date !== undefined) {
            handleRemoveContext();
            handleArrowBtn(options[options.indexOf(date)], 'next');
          }
        }}>
        <RightArrowIcon
          color="#313234"
        />
      </div>
      {(modalState.currentModal === 3 && window.innerWidth < 600)
        &&
        <div className={cn('date__elements', dateElement && 'hidden')}>
          <DateElement
            options={options}
            currentYear={currentYear}
            setIsFirst={setIsFirstEl}
            setIsLast={setIsLastEl}
            reflactUrl={reflactUrl}
            handleIsOpen={handleIsOpen}
            handleRemoveContext={handleRemoveContext}
          />
      </div>}
    </div>
  )
}

export default DateBoard;