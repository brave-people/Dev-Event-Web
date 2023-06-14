import React from "react"
import { Icon } from "types/icon"
import classNames from "classnames/bind"
import style from './Icon.module.scss'

const cn = classNames.bind(style);

function SearchIcon({ color, className, ...rest }: Icon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      fill="none"
      className={cn(className)}
      {...rest}
    >
    <path
      fill={color}
      d="m11.02 10.078 2.856 2.855-.943.943-2.855-2.855A6.002 6.002 0 0 1 .333 6.334c0-3.312 2.688-6 6-6a6.002 6.002 0 0 1 4.688 9.744Zm-1.337-.494a4.665 4.665 0 0 0-3.35-7.917 4.665 4.665 0 0 0-4.666 4.667 4.665 4.665 0 0 0 7.916 3.35l.1-.1Z"
    />
  </svg>
  )
}

export default SearchIcon