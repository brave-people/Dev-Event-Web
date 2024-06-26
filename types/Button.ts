import { MouseEventHandler } from 'react';

export type ButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  size?: string;
  label: string;
};
