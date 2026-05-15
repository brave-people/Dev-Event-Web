import React, { useContext } from 'react';
import classNames from 'classnames/bind';
import { WindowContext } from 'context/window';
import SunIcon from 'components/icons/SunIcon';
import MoonIcon from 'components/icons/MoonIcon';
import style from './ThemeToggle.module.scss';

const cn = classNames.bind(style);

const ThemeToggle: React.FC = () => {
  const { windowTheme, handleWindowTheme } = useContext(WindowContext);
  const isLight = windowTheme;

  return (
    <button
      type="button"
      className={cn('toggle', { 'is-dark': !isLight })}
      onClick={() => handleWindowTheme(!isLight)}
      aria-label={isLight ? '다크 모드로 전환' : '라이트 모드로 전환'}
      title={isLight ? '다크 모드로 전환' : '라이트 모드로 전환'}
    >
      <span className={cn('toggle__icon', 'toggle__icon--sun')} aria-hidden>
        <SunIcon />
      </span>
      <span className={cn('toggle__icon', 'toggle__icon--moon')} aria-hidden>
        <MoonIcon />
      </span>
    </button>
  );
};

export default ThemeToggle;
