import React, { useContext, useRef } from 'react';
import classNames from 'classnames/bind';
import style from 'components/common/input/BasicInput.module.scss'
import getIconByName from 'lib/utils/iconUtil';
import { DeleteIcon } from 'components/icons';
import { WindowContext } from 'context/window';
import { EventContext } from 'context/event';
import { useRouter } from 'next/router';
import { handleUrl } from 'lib/utils/urlUtil';
import { InputProps } from 'types/Input';

const cn = classNames.bind(style);

function BasicInput({ updateInput, submitInput, label, size, icon, iconStyle, input, initInput }: InputProps) {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { windowTheme } = useContext(WindowContext)
  const { jobGroupList, eventType, location, coast, search, handleSearch } = useContext(EventContext);
  const router = useRouter();
  return (
    <>
      <div className={cn('container')}>
        {icon !== undefined && getIconByName(icon, iconStyle, 'rgba(49, 50, 52, 1')}
        <input
          type="text"
          placeholder={label}
          className={cn('container__input', `size--${size}`)}
          onChange={updateInput}
          onKeyDown={submitInput}
          ref={searchRef}
          value={input || ""}
        />
        {search && 
        <div 
          className={cn('delete')} 
          onClick={() => {
            if (input !== undefined)
              initInput();
            if (search !== undefined )
              handleSearch(undefined);
            router.replace(handleUrl(`${router.asPath}`, 'kwd', jobGroupList, eventType, location, coast, search));
          }}>
          <DeleteIcon
            color={`${windowTheme ? "#d3d4d8" : "#797a81"}`}
          />
        </div>}
      </div>
    </>
  )
}

export default BasicInput;