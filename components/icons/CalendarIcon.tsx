import style from 'components/common/dropdown/DefaultDropdown.module.scss';
import { Icon } from 'types/icon';
import React from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

function CalendarIcon({ color, className, ...rest }: Icon) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} className={cn(className)} fill="none" {...rest}>
      <g clipPath="url(#a)">
        <path
          fill={color}
          d="M3.65.15c-.087.087-.15.362-.15.625v.475h-.913c-1.212 0-1.912.337-2.3 1.125C0 2.925 0 2.962 0 8.625c0 5.662 0 5.7.275 6.25.212.412.438.637.85.85C1.675 16 1.688 16 8 16c6.313 0 6.325 0 6.875-.275.412-.213.637-.438.85-.85.275-.55.275-.588.275-6.25s0-5.7-.275-6.25c-.4-.788-1.1-1.125-2.313-1.125h-.9l-.037-.512c-.075-1-.875-1-.95 0l-.037.512H4.5V.775C4.5.275 4.325 0 4 0a.552.552 0 0 0-.35.15ZM15 9.887v4.388l-.363.362-.362.363H1.725l-.363-.363L1 14.275V5.5h14v4.387Z"
        />
      </g>
    </svg>
  );
}

export default CalendarIcon;
