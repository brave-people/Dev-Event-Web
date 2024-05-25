import React from 'react';
import { Icon } from '../../types/Icon';

function SunIcon({ color, className, ...rest }: Icon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      {...rest}
    >
      <g clipPath="url(#a)">
        <path
          fill="#797A81"
          fillRule="evenodd"
          d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12ZM11 1a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0V1Zm0 20a1 1 0 1 1 2 0v2a1 1 0 1 1-2 0v-2Zm12-10a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2h2ZM3 13H1a1 1 0 1 1 0-2h2a1 1 0 1 1 0 2Zm3.536-7.879L5.12 3.707a1 1 0 1 0-1.414 1.414l1.414 1.414a1 1 0 1 0 1.415-1.414ZM19.12 3.707l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.415-1.414a1 1 0 0 0-1.415-1.414ZM6.536 19.121 5.12 20.536a1 1 0 1 1-1.414-1.415l1.414-1.414a1 1 0 0 1 1.415 1.414Zm12.585 1.415-1.414-1.415a1 1 0 0 1 1.414-1.414l1.415 1.414a1 1 0 0 1-1.415 1.415Z"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
export default SunIcon;
