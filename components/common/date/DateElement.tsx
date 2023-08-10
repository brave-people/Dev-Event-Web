import React, { Dispatch, SetStateAction, useContext } from "react";
import { getCurrentDate } from "lib/utils/dateUtil";
import { EventContext } from "context/event";
import { WindowContext } from "context/window";
import classNames from "classnames/bind";
import style from 'components/common/date/DateElement.module.scss';
import invalidEvent from "components/events/invalidEvent";
import { useRouter } from "next/router";

const cn = classNames.bind(style)

type Props = {
  options: string[];
  currentYear: string;
  setIsFirst: Dispatch<SetStateAction<boolean>>;
  setIsLast: Dispatch<SetStateAction<boolean>>;
  handleIsOpen: (isOpen: boolean) => void;
  handleRemoveContext: () => void;
}

function DateElement({ options, currentYear, setIsFirst, setIsLast, handleIsOpen, handleRemoveContext }: Props) {
  const router = useRouter();
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
              if (option > getCurrentDate() || invalidEvent.includes(option))
                return ;
              const year = option.slice(0, 4);
              const month = option.slice(6, 8);
              router.replace(`/calender?year=${year}&month=${month}`);
              handleRemoveContext();
              handleCurrentDate(option);
              handleIsOpen(false);
            }}
            className={cn('date__element', 
            `${(option > getCurrentDate() || invalidEvent.includes(option)) && "date__invalid"}`,
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