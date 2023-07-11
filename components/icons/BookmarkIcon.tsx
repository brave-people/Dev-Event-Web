import React, { useState } from "react";
import { Icon } from "types/icon";
import classNames from "classnames/bind";
import style from 'components/icons/Icon.module.scss';

const cn = classNames.bind(style);

function BookmarkIcon ({ color, className, ...rest }: Icon) {
  const [isHover, setIsHover] = useState<boolean>(false);
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={21}
    fill="none"
    className={cn(className)}
    onMouseOver={() => setIsHover(true)}
    onMouseLeave={() => setIsHover(false)}
    {...rest}
  >
    <path
      stroke={`${isHover ? "#230077e8" : "#ABACB3"}`}
      strokeLinejoin="round"
      strokeWidth={2}
      d="M1 20V1h14v19l-7-4.5L1 20Z"
    />
  </svg>
  )
} 

export default BookmarkIcon