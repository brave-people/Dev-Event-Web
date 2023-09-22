import { Icon } from 'types/icon';
import React from 'react';
import classNames from 'classnames/bind';
import style from './Icon.module.scss';

const cn = classNames.bind(style);

const PlusIcon = ({ color, className, ...rest }: Icon) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} fill="none" className={cn(className)} {...rest}>
    <path
      fill={color}
      d="M6 .661c.345 0 .625.28.625.625v4.089h4.089a.625.625 0 1 1 0 1.25H6.625v4.089a.625.625 0 1 1-1.25 0V6.625h-4.09a.625.625 0 0 1 .001-1.25h4.089v-4.09c0-.344.28-.624.625-.624Z"
      clipRule="evenodd"
    />
  </svg>
);

export default PlusIcon;
