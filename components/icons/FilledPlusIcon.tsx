import * as React from 'react';
import { Icon } from '../../types/Icon';

const FilledPlusIcon = ({ color, className, ...rest }: Icon) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...rest}
  >
    <circle cx={10} cy={10} r={10} fill="#333" />
    <g clipPath="url(#a)">
      <path
        fill="#fff"
        d="M3.194 10c0 .155.077.342.166.43.1.1 1.491.167 3.093.178h2.94v2.939c.01 1.602.077 2.994.176 3.093.21.21.652.21.862 0 .1-.1.166-1.491.177-3.093v-2.94h2.939c1.602-.01 2.994-.077 3.093-.176.21-.21.21-.652 0-.862-.1-.1-1.491-.166-3.093-.177h-2.94V6.453c-.01-1.602-.077-2.994-.176-3.093-.21-.21-.652-.21-.862 0-.1.1-.166 1.491-.177 3.093v2.94H6.453c-1.602.01-2.994.077-3.093.176a.687.687 0 0 0-.166.431Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M2.929 10 10 2.929 17.071 10 10 17.071z" />
      </clipPath>
    </defs>
  </svg>
);
export default FilledPlusIcon;
