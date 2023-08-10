import React from 'react'
import { Icon } from 'types/icon'

type NewIcon = Icon & {
  backgroundColor: string
}

function NewBulletIcon ({ color, backgroundColor, className, ...rest }: NewIcon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={24}
      fill="none"
      {...rest}
    >
      <path fill={backgroundColor} d="M0 4a4 4 0 0 1 4-4h36v20a4 4 0 0 1-4 4H0V4Z" />
      <path
        fill={color}
        d="M15.57 16h-1.184l-4.3-6.205h-.077V16H8.72V7.516h1.196l4.295 6.21h.076v-6.21h1.283V16Zm4.131.129c-.617 0-1.154-.135-1.611-.404a2.69 2.69 0 0 1-1.055-1.143c-.246-.492-.369-1.064-.369-1.717 0-.648.123-1.224.37-1.728.245-.504.589-.893 1.03-1.166.446-.278.961-.416 1.547-.416.512 0 .98.111 1.407.334.43.218.773.568 1.03 1.049.259.476.387 1.08.387 1.81v.44H17.37v-.932h3.844c0-.316-.067-.602-.2-.856a1.434 1.434 0 0 0-.556-.603 1.591 1.591 0 0 0-.832-.217 1.633 1.633 0 0 0-1.5.908c-.14.278-.213.575-.217.89v.727c0 .418.076.778.229 1.079.152.296.363.525.633.685.27.156.582.235.937.235a2.01 2.01 0 0 0 .615-.1c.184-.063.338-.145.463-.246.13-.102.23-.219.305-.352h1.271c-.097.348-.267.65-.51.909a2.415 2.415 0 0 1-.913.603c-.368.14-.78.21-1.237.21Zm3.223-6.492h1.295l1.242 4.67h.059l1.242-4.67h1.295l1.236 4.64h.065l1.236-4.64h1.283L30.014 16h-1.277l-1.29-4.582h-.087L26.076 16h-1.283l-1.869-6.363Z"
      />
    </svg>
  )
} 

export default NewBulletIcon;
