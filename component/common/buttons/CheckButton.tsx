import classNames from 'classnames/bind';
import React from 'react';
import style from './CheckButton.module.scss';

const cn = classNames.bind(style);

function CheckButton({ onClick, label, value }: any) {
  return (
    <div className={cn('button')} onClick={onClick}>
      <input className={style.checkbox} type="checkbox" checked={value}></input>
      <span className={style.label}>{label}</span>
    </div>
  );
}

export default CheckButton;
