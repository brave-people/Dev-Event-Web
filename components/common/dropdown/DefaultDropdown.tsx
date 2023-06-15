import { useOnClickOutside } from "lib/hooks/useOnClickOutside";
import { useRef, useState } from "react";
import style from './DefaultDropdown.module.scss'
import classNames from "classnames/bind";
import DownArrowIcon from "components/icons/DownArowIcon";

const cn = classNames.bind(style);

type DefaultDropdownProps = {
  title: string;
  options?: string[];
  size?: string;
}

function DefaultDropdown({ title, options, size }: DefaultDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const outSideRef = useRef(null);

  const handleClickOutside = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };
  const handleClickDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  useOnClickOutside({ ref: outSideRef, handler: handleClickOutside, mouseEvent: 'click' });

  return (
    <>
      <div className={cn('dropdown')} ref={outSideRef}>
        <div className={cn('dropdown__header')} onClick={handleClickDropdown}>
          <span className={cn('dropdown__header__placeholder')}>
            <span>{title}</span>
          </span>
          <DownArrowIcon
            color="rgba(49, 50, 52, 1)"
            className={isOpen ? 'active' : 'unactive'}
          />
        </div>
        {isOpen && (
        <div className={cn('dropdown__list')}>
            {options?.map((option, idx) => {
              return (
                <div 
                  key={idx}
                  className={cn('dropdown__list__element')}>
                  {option}
                </div>
              )
            })}
          </div>
      )}
      </div>
    </>
  );
}

export default DefaultDropdown;