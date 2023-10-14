import style from 'components/icons/Icon.module.scss';
import { Icon } from 'types/icon';
import React from 'react';
import classNames from 'classnames/bind';

type BookmarkIconProps = Icon & {
  isFavorite: boolean;
};
const cn = classNames.bind(style);

const BookmarkIconMobile = ({ className, isFavorite, ...rest }: BookmarkIconProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={12} height={16} className={cn(className)} fill="none" {...rest}>
      <g clipPath="url(#a)">
        <path
          {...(isFavorite ? { fill: '#2C4CEF', stroke: '#2C4CEF' } : { stroke: '#ABACB3' })}
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
  );
};

export default BookmarkIconMobile;
