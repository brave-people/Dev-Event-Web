import React, { useContext, useEffect, useRef, useState } from "react";
import style from './DateBoard.module.scss'
import classNames from "classnames/bind";
import { LeftArrowIcon, RightArrowIcon } from "components/icons";
import { useOnClickOutside } from "lib/hooks/useOnClickOutside";
import { EventContext } from "context/event";
import { getCurrentDate, getMonth } from "lib/utils/dateUtil";
import DateElement from "./DateElement";

const cn = classNames.bind(style);

type Props = {
  options: string[];
}

function DateBoard({ options }: Props) {
  const year = new Date().getFullYear().toString();
  const month = getMonth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFirstEl, setIsFirstEl] = useState<boolean>(false);
  const [isLastEl, setIsLastEl] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<string>(year);
  const [currentMonth, setCurrentMonth] = useState<string>(month);
  const { date, handleDate } = useContext(EventContext);
  const outSideRef = useRef(null);

  const handleClose = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

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

  const handleArrowBtn = (date: string, type: string) => {
    const current = options.indexOf(date);
    if (type === 'prev' && current !== 1) {
      if (current !== 1)
        handleDate(options[current - 1]);
      if (current - 1 === 1)
        setIsFirstEl(true);
      else
        setIsFirstEl(false);
      setIsLastEl(false);
    } else if (type === 'next' && current !== options.length - 1) {
      if (current - 1 !== options.length - 1)
        handleDate(options[current + 1]);
      if (current + 1 === options.length - 1)
        setIsLastEl(true);
      else
        setIsLastEl(false);
      setIsFirstEl(false);
    }
  }

  useOnClickOutside({ ref: outSideRef, handler: handleClose, mouseEvent: 'click' });
  
  useEffect(() => {
    const initDate = `${currentYear}년 ${currentMonth.length === 2 ? currentMonth : `0${currentMonth}`}월`;
    if (date === undefined)
      handleDate(initDate);
  }, [])

  return (
    <div className={cn('container')} ref={outSideRef}>
      <div
        className={cn('key', 'key--left', `${isLastEl ? 'key--disactive' : 'key--active'}`)}
        onClick={() => {
          (date !== undefined) && handleArrowBtn(date, 'prev');
        }}>
        <LeftArrowIcon
          color="#313234"
        />
      </div>
      <div className={cn('dropdown')}>
        <div className={cn('dropdown__header')} onClick={handleClickDropdown}>
          {date ? <span>{date}</span> : <span>{`${currentYear}년 ${currentMonth}월`}</span>}
        </div>
        {isOpen && (
          <div className={cn('dropdown__list')}>
            <div className={cn("dropdown__list__year")}>
              <div
                className={cn(`${parseInt(currentYear) === parseInt(year) - 1 ? "unvalid__key" : "year__key"}`)}
                onClick={() => {
                  if (parseInt(currentYear) === parseInt(year) - 1) 
                    return ;
                  else {
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
                className={cn(`${parseInt(currentYear) === parseInt(year) ? "unvalid__key" : "year__key"}`)}
                onClick={() => {
                  if (parseInt(currentYear) === parseInt(year)) 
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
            />
          </div>
        )}
      </div>
      <div 
        className={cn('key--right', `${date && date >= getCurrentDate() ? 'key--disactive' : 'key--active'}`)}
        onClick={() => {
          if (date === undefined || date >= getCurrentDate())
            return ;
          handleArrowBtn(options[options.indexOf(date)], 'next')
        }}>
        <RightArrowIcon
          color="#313234"
        />
      </div>
    </div>
  )
}

export default DateBoard;