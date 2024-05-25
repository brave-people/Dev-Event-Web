import React from 'react';
import { Icon } from '../../types/Icon';

function CheckIcon({ color, className, ...rest }: Icon) {
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
          fill="#03C754"
          d="m10 15.172 9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414 4.95 4.95Z"
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
export default CheckIcon;
