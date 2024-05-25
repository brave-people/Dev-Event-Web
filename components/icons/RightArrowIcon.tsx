import { WindowContext } from 'context/window';
import React, { useContext } from 'react';
import { Icon } from '../../types/Icon';

function RightArrowIcon({ color, className, ...rest }: Icon) {
  const { windowTheme } = useContext(WindowContext);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={6}
      height={10}
      fill="none"
      {...rest}
    >
      <path
        stroke={`${
          windowTheme ? 'rgba(49, 50, 52, 1)' : 'rgba(203, 203, 206, 1)'
        }`}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m1 9 3.646-3.646a.5.5 0 0 0 0-.708L1 1"
      />
    </svg>
  );
}
export default RightArrowIcon;
