import style from 'components/icons/Icon.module.scss';
import { Icon } from 'types/icon';
import React from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type BookmarkIconProps = Icon & {
  isFavorite: boolean;
};

function BookmarkIcon({ color, className, isFavorite, ...rest }: BookmarkIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={21} fill="none" className={cn(className)} {...rest}>
      <path
        {...(isFavorite ? { fill: '#2C4CEF' } : { stroke: '#ABACB3' })}
        strokeLinejoin="round"
        strokeWidth={2}
        d="M1 20V1h14v19l-7-4.5L1 20Z"
      />
    </svg>
  );
}

export default BookmarkIcon;
