import React from 'react';
import classNames from 'classnames/bind';
import style from './DefaultInput.module.scss'
import getIconByName from 'lib/utils/iconUtil';

const cn = classNames.bind(style);

type InputProps = {
  updateInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  submitInput: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  label: string;
  size?: string;
  icon?: string;
  iconStyle?: string;
}

function DefaultInput({ updateInput, submitInput, label, size, icon, iconStyle }: InputProps) {
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
        />
      </div>
    </>
  )
}

export default DefaultInput;