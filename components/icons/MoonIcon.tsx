import { Icon } from 'types/icon';
import React from 'react';

function MoonIcon({ color, className, ...rest }: Icon) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...rest}>
      <path
        fill="#747579"
        d="M10.476 2.148c.37-.064.584.394.35.687a7.5 7.5 0 0 0 10.538 10.538c.294-.233.752-.018.688.351C21.235 18.425 17.135 22 12.2 22c-5.523 0-10-4.477-10-10 0-4.935 3.575-9.035 8.276-9.852Z"
      />
    </svg>
  );
}

export default MoonIcon;
