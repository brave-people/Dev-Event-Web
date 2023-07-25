import React, { useContext } from "react";
import Image from "next/image";
import classNames from "classnames/bind";
import style from 'components/features/ThemeToggle/ThemeToggle.module.scss'
import { WindowContext } from "context/window";
import { MoonIcon, SunIcon } from "components/icons";

const cn = classNames.bind(style);

function Theme() {
  const { windowTheme, handleWindowTheme } = useContext(WindowContext);
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.checked
      ? document.documentElement.setAttribute("data-theme", "dark")
      : document.documentElement.setAttribute("data-theme", "light");
  };
  return (
    <>
      <div className={cn('toggle')}>
        <input 
          type="checkbox" 
          id="switch" 
          name="mode" 
          onClick={() => 
            handleWindowTheme(windowTheme)} 
          onChange={onChange} />
        <label htmlFor="switch">
          {windowTheme 
            ? <MoonIcon /> 
            : <Image
              src={'/icon/sun.png'}
              width={28}
              height={28}
            />}
        </label>
      </div>
    </>
  )
}

export default Theme;