import React, { useContext } from "react"
import { Icon } from '../../types/Icon';
import style from './Icon.module.scss'
import classNames from "classnames/bind"
import { WindowContext } from "context/window";

const cn = classNames.bind(style);

function DownArrowIcon({ color, className, ...rest }: Icon ) {
  const { windowTheme } = useContext(WindowContext);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={10}
      height={6}
      fill="none"
      className={cn(className)}
      {...rest}
    >
      <path
        stroke={`${windowTheme ? "rgba(49, 50, 52, 1)" : "rgba(203, 203, 206, 1)"}`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m1 1 3.646 3.646a.5.5 0 0 0 .708 0L9 1"
      />
    </svg>
  )
}

export default DownArrowIcon;