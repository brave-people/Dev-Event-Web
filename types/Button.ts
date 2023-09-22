import { MouseEventHandler } from 'react';

export type ButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  label: string;
};
