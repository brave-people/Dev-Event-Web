import React from 'react';
import { Icon } from '../../types/Icon';
import style from 'components/common/dropdown/DefaultDropdown.module.scss';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

function PeopleIcon({ color, className, ...rest }: Icon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      className={cn(className)}
      fill="none"
      {...rest}
    >
      <path
        fill={color}
        d="M6.75 1.712C4.188 3.063 5.113 6.876 8 6.876c2.137 0 3.4-2.112 2.4-4.013-.462-.875-1.25-1.387-2.25-1.462-.6-.037-.825.013-1.4.313Zm2.15.863c1.262.637 1.225 2.537-.075 3.162C8.538 5.888 8.163 6 8 6c-.162 0-.537-.112-.825-.263-1.45-.7-1.287-2.762.263-3.3.525-.174.9-.137 1.462.138Z"
      />
      <path
        fill={color}
        d="M2.15 4.213c-1.225.6-1.437 2.274-.412 3.3 1.112 1.112 2.962.575 3.375-.988.462-1.688-1.363-3.1-2.963-2.313Zm1.825 1.112c.625.712.113 1.8-.85 1.8-.9 0-1.438-1-.925-1.725.425-.6 1.275-.638 1.775-.075ZM11.9 4.213c-1.238.612-1.45 2.262-.412 3.3.812.812 1.962.812 2.774 0 1.363-1.363.5-3.525-1.412-3.513-.287 0-.725.1-.95.213Zm1.825 1.112c.625.713.113 1.8-.85 1.8-.9 0-1.438-1-.925-1.725.425-.6 1.275-.637 1.775-.075Z"
      />
      <path
        fill={color}
        d="M6.162 7.237a2.785 2.785 0 0 0-1.362.85c-.263.313-.325.313-1.563.3-1.137-.024-1.375.013-1.85.263-.312.162-.737.5-.937.762-.375.475-.387.513-.437 2.125-.05 1.95.075 2.488.65 2.838.387.238.674.25 7.337.25 6.662 0 6.95-.012 7.338-.25.575-.35.7-.887.65-2.838-.05-1.612-.063-1.65-.438-2.125-.2-.262-.625-.6-.938-.762-.475-.25-.712-.287-1.825-.263-1.275.013-1.287.013-1.625-.35-.675-.725-1.062-.837-2.912-.875-.925-.012-1.875.026-2.088.075ZM10 8.313c.713.363.75.526.75 3.088v2.35h-5.5v-2.325c0-1.4.05-2.413.138-2.563.062-.137.312-.362.524-.487.338-.213.638-.25 2.063-.25 1.225 0 1.75.05 2.025.188Zm-5.75 3.25v2.188H2.862c-.762 0-1.487-.063-1.625-.125C1.026 13.5 1 13.35 1 11.812V10.15l.387-.388c.375-.375.4-.387 1.626-.387H4.25v2.188Zm10.363-1.8.387.388v1.662c0 1.538-.025 1.688-.238 1.813-.137.063-.862.125-1.625.125H11.75V9.375h1.238c1.225 0 1.25.012 1.625.387Z"
      />
    </svg>
  );
}

export default PeopleIcon;
