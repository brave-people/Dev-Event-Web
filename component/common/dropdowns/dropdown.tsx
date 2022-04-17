import classNames from 'classnames/bind';
import style from './dropdown.module.scss';
import React, { useEffect, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

const cx = classNames.bind(style);

export default function Dropdown({ name, options, placeholder, value, onClick, icon }: any) {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <div className={cx('dropdown')}>
        <div
          className={cx('dropdown__header')}
          onClick={(event) => {
            setOpen(!isOpen);
          }}
        >
          <span className={cx('dropdown__header__placeholder')}>
            <span className={cx('icon')}>{icon}</span>
            {placeholder}
          </span>
          <IoIosArrowDown size="12" color="#3D3D3D" />
        </div>

        {isOpen == false ? null : (
          <div className={cx('dropdown__list')}>
            {options.map((item: any, index: number) => {
              return (
                <div
                  key={index}
                  className={cx('dropdown__list__item')}
                  onClick={(event) => {
                    setOpen(false);
                    !onClick ? null : onClick(event, item);
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
