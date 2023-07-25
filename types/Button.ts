import { MouseEventHandler } from "react"

export type DefaultButton = {
  onClick: MouseEventHandler<HTMLButtonElement>;
  label: string;
  size: string;
}