import React, { useContext, useRef, Dispatch, SetStateAction } from 'react';
import classNames from 'classnames/bind';
import style from './DefaultInput.module.scss'
import getIconByName from 'lib/utils/iconUtil';
import { DeleteIcon } from 'components/icons';
import { WindowContext } from 'context/window';
import { EventContext } from 'context/event';

const cn = classNames.bind(style);

type InputProps = {
  updateInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  submitInput: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  label: string;
  size?: string;
  icon?: string;
  iconStyle?: string;
  initInput: () => void;
  input: string | undefined;
}

function DefaultInput({ updateInput, submitInput, label, size, icon, iconStyle, input, initInput }: InputProps) {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { windowTheme } = useContext(WindowContext)
  const { search, handleSearch } = useContext(EventContext);
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
          }}>
          <DeleteIcon
            color={`${windowTheme ? "#d3d4d8" : "#797a81"}`}
          />
        </div>}
      </div>
    </>
  )
}

export default DefaultInput;