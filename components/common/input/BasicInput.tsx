import style from 'components/common/input/BasicInput.module.scss';
import { DeleteIcon } from 'components/icons';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import getIconByName from 'lib/utils/iconUtil';
import { InputProps } from 'types/Input';
import React, { useContext, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

function BasicInput({
  updateInput,
  submitInput,
  label,
  size,
  icon,
  iconStyle,
  input,
  initInput,
}: InputProps) {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { windowTheme } = useContext(WindowContext);
  const { search } = useContext(EventContext);
  const { modalState } = useContext(WindowContext);

  useEffect(() => {
    if (window.innerWidth < 600 && modalState.currentModal === 1) {
      searchRef.current?.focus();
    }
  }, []);

  return (
    <>
      <div className={cn('container')}>
        {icon !== undefined &&
          getIconByName(icon, iconStyle, 'rgba(49, 50, 52, 1')}
        <input
          type="text"
          placeholder={label}
          className={cn('container__input', `size--${size}`)}
          onChange={updateInput}
          onKeyDown={submitInput}
          ref={searchRef}
          value={input || ''}
        />
        {search && (
          <div
            className={cn('delete')}
            onClick={() => {
              initInput();
            }}
          >
            <DeleteIcon color={`${windowTheme ? '#d3d4d8' : '#797a81'}`} />
          </div>
        )}
      </div>
    </>
  );
}

export default BasicInput;
