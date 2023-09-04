import React from 'react'
import { Icon } from 'types/icon'
import classNames from "classnames/bind";
import style from 'components/icons/Icon.module.scss';

type BookmarkIconProps  = Icon & {
  isFavorite: boolean;
}
const cn = classNames.bind(style);

const BookmarkIconMobile = ({ color, className, isFavorite, ...rest }: BookmarkIconProps) => {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={16}
    className={cn(className)}
    fill="none"
    {...rest}
  >
    <g clipPath="url(#a)">
      <path
        stroke={`${isFavorite ? "#230077e8" : "#ABACB3"}`}
        strokeLinejoin="round"
        strokeWidth={2}
        d="M.75 15V.75h10.5V15L6 11.625.75 15Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h12v15.75H0z" />
      </clipPath>
    </defs>
  </svg>
)
}

export default BookmarkIconMobile