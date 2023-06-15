import React from "react"
import { Icon } from "types/icon"
import style from './Icon.module.scss'
import classNames from "classnames/bind"

const cn = classNames.bind(style);

function DownArrowIcon({ color, className, ...rest }: Icon ) {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={13}
    height={13}
    fill="none"
    className={cn(className)}
    {...rest}
  >
    <path
      fill={color}
      d="M2.153 4.184a.449.449 0 0 0-.122.285c0 .203 4.266 4.468 4.469 4.468.203 0 4.469-4.275 4.469-4.478 0-.193-.203-.396-.396-.396-.092 0-1.036.883-2.113 1.95L6.5 7.973l-1.96-1.96c-1.077-1.067-2.021-1.95-2.113-1.95a.446.446 0 0 0-.274.121Z"
    />
  </svg>
  )
}

export default DownArrowIcon;