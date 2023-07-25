import React, { Dispatch, SetStateAction, useContext } from "react";
import { getCurrentDate } from "lib/utils/dateUtil";
import { EventContext } from "context/event";
import { WindowContext } from "context/window";
import classNames from "classnames/bind";
import style from 'components/common/date/DateElement.module.scss'

const cn = classNames.bind(style)

type Props = {
  options: string[];
  currentYear: string;
  setIsFirst: Dispatch<SetStateAction<boolean>>;
  setIsLast: Dispatch<SetStateAction<boolean>>;
  handleIsOpen: (isOpen: boolean) => void;
}

function DateElement({ options, currentYear, setIsFirst, setIsLast, handleIsOpen }: Props) {
  
  const { date, handleDate } = useContext(EventContext);
  const { windowTheme } = useContext(WindowContext);

  const handleCurrentDate = (currentDate: string) => {
    const current = options.indexOf(currentDate);
    if (current === 1) {
      setIsFirst(true);
      setIsLast(false)
    } else if (current === options.length - 1) {
      setIsLast(true)
      setIsFirst(false)
    } else {
      setIsFirst(false);
      setIsLast(false);
    }
    handleDate(options[current]);
    handleIsOpen(false);
  }
  return (
    <div className={cn("date")}>
      {options?.sort().map((option, idx) => {
        if (option.includes(currentYear))
        return (
          <div
            key={idx}
            onClick={() => {
              if (option > getCurrentDate())
                return ;
              handleCurrentDate(option)
              handleIsOpen(false);
            }}
            className={cn('date__element', 
            `${option > getCurrentDate() && "date__invalid"}`,
            `${date === option && 
            (windowTheme ? "light--selected" : "dark--selected")}`)}>
              {option.split(' ')[1]}
          </div>
        )
      })}
    </div>
  )
}

export default DateElement;