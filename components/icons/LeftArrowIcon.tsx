import React from "react"
import { Icon } from "types/icon"

function LeftArrowIcon({ color, className, ...rest }: Icon) {
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
      d="M8.816 2.153a.449.449 0 0 0-.285-.122c-.203 0-4.469 4.266-4.469 4.469 0 .203 4.276 4.469 4.48 4.469.192 0 .396-.203.396-.396 0-.092-.884-1.036-1.95-2.113L5.027 6.5l1.96-1.96c1.066-1.077 1.95-2.021 1.95-2.113a.446.446 0 0 0-.122-.274Z"
    />
  </svg>
  )
}
export default LeftArrowIcon