import React from 'react';
import { Icon } from '../../types/Icon';

type EndIcon = Icon & {
  backgroundColor: string;
}

function EndBulletIcon({ color, backgroundColor, className, ...rest}: EndIcon) {
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
        d="M15.462 12.168h-1.096v-1.934h1.096v1.934Zm4.248.393h-9.574v-.909h9.574v.909Zm-4.793.767c.754 0 1.402.07 1.945.211.547.137.963.344 1.248.621.285.274.43.604.434.99a1.33 1.33 0 0 1-.434.99c-.285.274-.7.481-1.248.622-.543.144-1.191.216-1.945.216-.762 0-1.416-.072-1.963-.216-.543-.14-.959-.348-1.248-.621-.29-.27-.434-.6-.434-.99 0-.387.145-.717.434-.99.289-.278.705-.485 1.248-.622.547-.14 1.201-.21 1.963-.21Zm0 .867c-.54 0-.996.037-1.371.112-.375.07-.66.177-.856.322-.195.14-.29.314-.287.521-.004.211.09.39.281.534.196.144.48.254.856.328.379.078.838.117 1.377.117.535 0 .988-.04 1.36-.117.374-.075.66-.184.855-.328.195-.145.293-.323.293-.534 0-.207-.098-.38-.293-.521-.196-.145-.48-.252-.856-.322a7.062 7.062 0 0 0-1.36-.112Zm.252-6.498a2.278 2.278 0 0 1-.545 1.465c-.356.434-.848.79-1.477 1.066a7.216 7.216 0 0 1-2.12.551l-.4-.873a6.721 6.721 0 0 0 1.811-.422c.543-.214.97-.476 1.278-.785.308-.308.463-.642.463-1.002v-.304h.99v.304Zm.492 0c0 .356.154.688.463.996.312.309.738.573 1.277.791a6.73 6.73 0 0 0 1.817.422l-.405.873a7.28 7.28 0 0 1-2.12-.55c-.626-.278-1.12-.633-1.483-1.067a2.222 2.222 0 0 1-.545-1.465v-.304h.996v.304Zm3.193.164H11.01v-.89h7.845v.89Zm5.122 7.336h-1.09v-2.566h1.09v2.566Zm3.38-.017h-1.09v-2.567h1.09v2.567Zm2.52.556h-9.61v-.92h9.61v.92Zm-1.178-5.22h-6.152v2.015h-1.107V9.613h6.164V8.148H21.42V7.24h7.277v3.276Zm.247 2.431h-7.506v-.908h7.506v.908Z"
      />
    </svg>
  )
}
 
export default EndBulletIcon;