import React from 'react';
import { Icon } from '../../types/Icon';

const ShareIconMobile = ({ color, className, ...rest }: Icon) => {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={15}
    fill="none"
    {...rest}
  >
    <path
      fill="#ABACB3"
      d="M8.194 11.071 5.1 9.384a2.947 2.947 0 1 1 0-4.027l3.095-1.688A2.947 2.947 0 1 1 8.9 4.963L5.807 6.65c.118.473.118.967 0 1.44L8.9 9.777a2.948 2.948 0 1 1-.707 1.293v.001ZM2.948 8.844a1.474 1.474 0 1 0 0-2.948 1.474 1.474 0 0 0 0 2.948Zm8.105-4.422a1.474 1.474 0 1 0 0-2.947 1.474 1.474 0 0 0 0 2.947Zm0 8.843a1.474 1.474 0 1 0 0-2.948 1.474 1.474 0 0 0 0 2.948Z"
    />
  </svg>
  )
}

export default ShareIconMobile