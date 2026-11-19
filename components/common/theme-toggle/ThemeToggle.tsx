import React, { useContext } from 'react';
import classNames from 'classnames/bind';
import { WindowContext } from 'context/window';
import style from './ThemeToggle.module.scss';

const cn = classNames.bind(style);

const MoonGlyph = () => (
  <svg
    className={cn('toggle__moon')}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunGlyph = () => (
  <svg
    className={cn('toggle__sun')}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx={12} cy={12} r={4} />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

// 어느 아이콘을 보일지는 상태가 아니라 html[data-theme]로 CSS가 정한다.
// (SSR 직후 상태와 실제 테마가 달라 아이콘이 바뀌어 보이는 것을 막는다.)
const ThemeToggle: React.FC = () => {
  const { windowTheme, handleWindowTheme } = useContext(WindowContext);

  return (
    <button
      type="button"
      className={cn('toggle')}
      onClick={() => handleWindowTheme(!windowTheme)}
      aria-label="밝은 화면, 어두운 화면 바꾸기"
    >
      <MoonGlyph />
      <SunGlyph />
    </button>
  );
};

export default ThemeToggle;
