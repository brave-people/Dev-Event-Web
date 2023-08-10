import React, { useContext, useEffect, useRef, useState } from "react";
import style from 'components/common/date/DateBoard.module.scss'
import classNames from "classnames/bind";
import { LeftArrowIcon, RightArrowIcon } from "components/icons";
import { useOnClickOutside } from "lib/hooks/useOnClickOutside";
import { EventContext } from "context/event";
import { getCurrentDate, getMonth } from "lib/utils/dateUtil";
import DateElement from "./DateElement";
import { useRouter } from "next/router";

const cn = classNames.bind(style);

type Props = {
  options: string[];
}

function DateBoard({ options }: Props) {
  const router = useRouter();

  const initYear = router.asPath.includes('calender') ? router.asPath.slice(15, 19) : new Date().getFullYear().toString();
  const initMonth = router.asPath.includes('calender') ? router.asPath.slice(26, 28) : getMonth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFirstEl, setIsFirstEl] = useState<boolean>(false);
  const [isLastEl, setIsLastEl] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<string>(initYear);
  const [currentMonth, setCurrentMonth] = useState<string>(initMonth);
  const { 
    date, handleDate, handleSearch, handleLocation, handleEventType, handleCoast, initJobGroupList 
  } = useContext(EventContext);  const outSideRef = useRef(null);

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
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleArrowBtn = (dateArg: string | undefined, type: string) => {
    if (type === "prev" && dateArg === undefined) {
      const last = options.length - 1;
      handleDate(`${currentYear}년 ${currentMonth}월`);
      setIsLastEl(false);
      router.replace(`/calender?year=${currentYear}&month=${currentMonth}`);
      return ;
    }
    if (dateArg !== undefined) {
      const current = options.indexOf(dateArg);
      if (type === 'prev' && current !== 1) {
        if (current !== 1) {
          const newYear = options[current - 1].slice(0, 4);
          const newMonth = options[current - 1].slice(6, 8);
          handleDate(options[current - 1]);
          setCurrentYear(newYear);
          setCurrentMonth(newMonth);
          router.replace(`/calender?year=${newYear}&month=${newMonth}`);
        }
        if (current - 1 === 1)
          setIsFirstEl(true);
        else
          setIsFirstEl(false);
        setIsLastEl(false);
      } else if (type === 'next' && current !== options.length - 1) {
        if (options[current] === `${initYear}년 ${initMonth}월`) {
          handleDate(undefined);
          setIsLastEl(true);
          router.replace('/events');
        } else {
          const newYear = options[current + 1].slice(0, 4);
          const newMonth = options[current + 1].slice(6, 8);
          handleDate(options[current + 1]);
          setCurrentYear(newYear);
          setCurrentMonth(newMonth);
          setIsFirstEl(false);
          router.replace(`/calender?year=${newYear}&month=${newMonth}`);
        }
      }
    }
  }

  useOnClickOutside({ ref: outSideRef, handler: handleClose, mouseEvent: 'click' });
  
  useEffect(() => {
    if (date === undefined) {
      if (router.asPath.includes('calender')) {
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
  }, [])

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
    </div>
  )
}

export default DateBoard;