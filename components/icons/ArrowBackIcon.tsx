import { WindowContext } from 'context/window';
import { Icon } from 'types/icon';
import { useContext } from 'react';

const ArrowBackIcon = ({ color, ...rest }: Icon) => {
  const { windowTheme } = useContext(WindowContext);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" {...rest}>
      <path
        fill={`${windowTheme ? '#20222D' : '#F2F2F2'}`}
        fillOpacity={0.6}
        d="m6.875 14.888-6.6-6.6a.877.877 0 0 1-.213-.325A1.107 1.107 0 0 1 0 7.588c0-.133.02-.258.063-.375a.877.877 0 0 1 .212-.325l6.6-6.6a.977.977 0 0 1 .688-.287.93.93 0 0 1 .712.287c.2.183.304.413.313.688a.93.93 0 0 1-.288.712l-4.9 4.9h11.175c.283 0 .52.096.713.287.191.192.287.43.287.713s-.096.52-.287.712a.968.968 0 0 1-.713.288H3.4l4.9 4.9c.183.183.28.417.287.7a.87.87 0 0 1-.287.7c-.183.2-.417.3-.7.3a.988.988 0 0 1-.725-.3Z"
      />
    </svg>
  );
};
export default ArrowBackIcon;
