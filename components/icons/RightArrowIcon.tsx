import React from "react"
import { Icon } from "types/icon"

function RightArrowIcon({ color, className, ...rest }: Icon) {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={13}
    height={13}
    fill="none"
    {...rest}
  >
    <path
      fill={color}
      d="M4.184 10.847a.449.449 0 0 0 .285.122c.203 0 4.468-4.266 4.468-4.469 0-.203-4.275-4.469-4.478-4.469-.193 0-.396.203-.396.396 0 .092.883 1.036 1.95 2.113l1.96 1.96-1.96 1.96c-1.067 1.077-1.95 2.021-1.95 2.113 0 .08.05.203.121.274Z"
    />
  </svg>
  )
}
export default RightArrowIcon
