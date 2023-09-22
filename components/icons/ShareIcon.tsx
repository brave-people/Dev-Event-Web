import style from 'components/icons/Icon.module.scss';
import { Icon } from 'types/icon';
import React from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

function ShareIcon({ color, className, ...rest }: Icon) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={19} height={22} fill="none" className={cn(className)} {...rest}>
      <path
        fill="#ABACB3"
        d="m11.12 16.023-4.199-2.29a4 4 0 1 1 0-5.465l4.2-2.29a4 4 0 1 1 .959 1.755l-4.2 2.29a4.008 4.008 0 0 1 0 1.954l4.199 2.29a4 4 0 1 1-.959 1.755v.001ZM4 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
      />
    </svg>
  );
}

export default ShareIcon;
