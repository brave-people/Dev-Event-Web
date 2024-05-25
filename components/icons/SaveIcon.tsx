import React from 'react';
import { Icon } from '../../types/Icon';

function SaveIcon({ color, className, ...rest }: Icon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={25}
      height={24}
      fill="none"
      {...rest}
    >
      <path
        fill="#2C4CEF"
        stroke="#2C4CEF"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.5 22V3h14v19l-7-4.5-7 4.5Z"
      />
    </svg>
  );
}

export default SaveIcon;
