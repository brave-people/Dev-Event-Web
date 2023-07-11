import React, { useState } from "react"
import { Icon } from "types/icon"
import classNames from "classnames/bind"
import style from 'components/icons/Icon.module.scss';

const cn = classNames.bind(style);

type ShareIcon  = Icon & {
  isFavorite: boolean;
}

function ShareIcon({ color, className, isFavorite, ...rest }: ShareIcon) {
  const [isHover, setIsHover] = useState<boolean>(false);
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={22}
    fill="none"
    className={cn(className)}
    onMouseOver={() => setIsHover(true)}
    onMouseLeave={() => setIsHover(false)}
    {...rest}
  >
    <path
      fill={`${isFavorite ? "#230077e8" : isHover ? "#230077e8" : "#ABACB3"}`}
      d="m11.12 16.023-4.199-2.29a4 4 0 1 1 0-5.465l4.2-2.29a4 4 0 1 1 .959 1.755l-4.2 2.29a4.008 4.008 0 0 1 0 1.954l4.199 2.29a4 4 0 1 1-.959 1.755v.001ZM4 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
    />
  </svg>
  )
} 

export default ShareIcon;