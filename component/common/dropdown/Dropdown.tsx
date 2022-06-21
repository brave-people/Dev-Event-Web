import classNames from 'classnames/bind';
import style from './dropdown.module.scss';
import React, { useRef, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import Tag from '../tag/Tag';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';

const cx = classNames.bind(style);

export default function Dropdown({ name, options, placeholder, value, onClick, icon, type = 'basic' }: any) {
  const [isOpen, setOpen] = useState(false);
  const outsideRef = useRef(null);

  const handleClickOutside = () => {
    setOpen(false);
  };
  const handleClickDropdown = () => {
    setOpen(!isOpen);
  };

  useOnClickOutside({ ref: outsideRef, handler: handleClickOutside, mouseEvent: 'click' });

  return (
    <>
      <div className={cx('dropdown')}>
        <div className={cx('dropdown__header')} ref={outsideRef} onClick={handleClickDropdown}>
          <span className={cx('dropdown__header__placeholder')}>
            <span className={cx('icon')}>{icon}</span>
            {value ? value : placeholder}
          </span>
          {!isOpen ? <IoIosArrowDown size="12" color="#3D3D3D" /> : <IoIosArrowUp size="12" color="#3D3D3D" />}
        </div>

        {isOpen == false ? null : type === 'basic' ? (
          <div className={cx('dropdown__list', `type--${type}`)}>
            {options.map((item: any, index: number) => {
              return (
                <div
                  key={index}
                  className={cx('dropdown__list__item', `type--${type}`)}
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
        ) : (
          <div className={cx('dropdown__list', `type--${type}`)}>
            <span>원하는 태그를 선택하세요.</span>
            <div className={cx('wrapper')}>
              {options.map((item: any, index: number) => {
                return (
                  <div
                    key={index}
                    className={cx('dropdown__list__item', `type--${type}`)}
                    onClick={(event) => {
                      setOpen(false);
                      !onClick ? null : onClick(event, item);
                    }}
                  >
                    <Tag label={item}></Tag>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
