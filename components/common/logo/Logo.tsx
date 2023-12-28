import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import React, { useContext } from 'react';
import Link from 'next/link';

function Logo() {
  const { initJobGroupList, handleEventType, handleLocation, handleCoast, handleSearch, handleDate, handleUrl } =
    useContext(EventContext);
  const { windowTheme } = useContext(WindowContext);
  const handleOnClick = () => {
    handleEventType(undefined);
    handleLocation(undefined);
    handleCoast(undefined);
    handleSearch(undefined);
    handleDate(undefined);
    handleUrl(undefined);
    initJobGroupList();
  };
  return (
    <Link href={'/events'}>
      <svg xmlns="http://www.w3.org/2000/svg" width={107} height={14} fill="none" onClick={handleOnClick}>
        <path
          fill={windowTheme ? 'rgba(49, 50, 52, 1)' : 'rgba(203, 203, 206, 1)'}
          d="M2.873 11.617V2.425h2.192c2.83 0 3.937 1.265 3.937 4.427 0 3.163-1.107 4.765-3.682 4.765H2.873ZM5.916 14c3.66 0 6.108-2.889 6.108-7.148S9.3 0 5.469 0H0v14h5.916ZM24.223 14v-2.488h-7.852V7.907h6.916V5.44H16.37V2.446h7.512V0H13.498v14h10.725ZM32.935 14l4.789-14h-3.065l-3.064 9.825L28.509 0h-3.15l4.789 14h2.787ZM39.163 14v-2.846h-2.959V14h2.959ZM55.916 14v-2.488h-7.853V7.907h6.916V5.44h-6.916V2.446h7.512V0H45.19v14h10.726ZM64.307 14l4.788-14h-3.064l-3.065 9.825L59.882 0h-3.15l4.788 14h2.788ZM81.137 14v-2.488h-7.852V7.907H80.2V5.44h-6.916V2.446h7.512V0H70.412v14h10.725ZM94.212 14V0h-2.766v9.003L85.827 0H82.7v14h2.745V4.596L91.488 14h2.724ZM102.722 14V2.446H107V0H95.508v2.446h4.256V14h2.958Z"
        />
      </svg>
    </Link>
  );
}

export default Logo;
