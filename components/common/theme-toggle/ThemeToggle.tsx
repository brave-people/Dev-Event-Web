import React, { useContext } from 'react';
import classNames from 'classnames/bind';
import { WindowContext } from 'context/window';
import style from './ThemeToggle.module.scss';

const cn = classNames.bind(style);

// Inline glyphs — kept local so we control viewBox + size precisely and avoid
// the clipping we got when the shared 24x24 MoonIcon was rendered at 18px.
const SunGlyph = () => (
  <svg
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

const MoonGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

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
        <SunGlyph />
      </span>
      <span className={cn('toggle__icon', 'toggle__icon--moon')} aria-hidden>
        <MoonGlyph />
      </span>
    </button>
  );
};

export default ThemeToggle;
