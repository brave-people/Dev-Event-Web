import { WindowContext } from 'context/window';
import React, { useContext } from 'react';
import { Icon } from '../../types/Icon';

function DeleteIcon({ color, className, ...rest }: Icon) {
  const { windowTheme } = useContext(WindowContext);
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
          stroke={`${windowTheme ? color : '#F2F2F2'}`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="m7 7 10 10m0-10L7 17"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill={color} d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default DeleteIcon;
