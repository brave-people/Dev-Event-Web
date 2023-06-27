import React, { useContext, useEffect, useRef, useState } from "react";
import style from './DateBoard.module.scss'
import classNames from "classnames/bind";
import { LeftArrowIcon, RightArrowIcon } from "components/icons";
import { useOnClickOutside } from "lib/hooks/useOnClickOutside";
import { EventContext } from "context/event";

const cn = classNames.bind(style);

type Props = {
  options: string[]
}

function DateBoard({ options }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFirstEl, setIsFirstEl] = useState<boolean>(true);
  const [isLastEl, setIsLastEl] = useState<boolean>(false);
  const { date, handleDate } = useContext(EventContext);
  const outSideRef = useRef(null);
  
  const handleClickOutside = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const handleClickDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleCurrentDate = (date: string) => {
    const current = options.indexOf(date);
    if (current === 1) {
      setIsFirstEl(true);
      setIsLastEl(false)
    } else if (current === options.length - 1) {
      setIsLastEl(true)
      setIsFirstEl(false)
    } else {
      setIsFirstEl(false);
      setIsLastEl(false);
    }
    handleDate(options[current]);
    setIsOpen(false);
  }

  const handleArrowBtn = (date: string, type: string) => {
    const current = options.indexOf(date);
    if (current === 0) {
      if (type === 'right') {
        handleDate(options[current + 1]);
        setIsFirstEl(true);
      } else if (type === 'left') {
        handleDate(options[options.length - 1]);
        setIsLastEl(true);
      }
      return ;
    }
    if (type === 'right' && current !== 1) {
      if (current !== 1) {
        handleDate(options[current - 1]);
      }
      if (current - 1 === 1)
        setIsFirstEl(true);
      else
        setIsFirstEl(false);
      setIsLastEl(false);
    } else if (type === 'left' && current !== options.length - 1) {
      if (current - 1 !== options.length - 1) {
        handleDate(options[current + 1]);
      }
      if (current + 1 === options.length - 1)
        setIsLastEl(true);
      else
        setIsLastEl(false);
      setIsFirstEl(false);
    }
  }

  useOnClickOutside({ ref: outSideRef, handler: handleClickOutside, mouseEvent: 'click' });
  useEffect(() => {
    handleDate(options[1])
  }, [])
  return (
    <div className={cn('container')} ref={outSideRef}>
      <div 
        className={cn('key--left', `${isLastEl ? 'key--disactive' : 'key--active'}`)}
        onClick={() => {
          if (date !== undefined) {
            handleArrowBtn(options[options.indexOf(date)], 'left')
          }
        }}>
        <LeftArrowIcon
          color="#313234"
        />
      </div>
      <div className={cn('dropdown')}>
        <div className={cn('dropdown__header')} onClick={handleClickDropdown}>
          {date ? <span>{date}</span> : <span>{options[1]}</span>}
        </div>
        {isOpen && (
          <div className={cn('dropdown__list')}>
            {options?.map((option, idx) => {
              return (
                <div
                  key={idx}
                  onClick={() => {
                    handleCurrentDate(option)
                    setIsOpen(false)
                  }}
                  className={cn('dropdown__list__element')}>
                    {option}
                  </div>
              )
            })}
          </div>
        )}
      </div>
      <div 
        className={cn('key--right', `${isFirstEl ? 'key--disactive' : 'key--active'}`)}
        onClick={() => {
          if (date !== undefined) {
            handleArrowBtn(options[options.indexOf(date)], 'right')
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