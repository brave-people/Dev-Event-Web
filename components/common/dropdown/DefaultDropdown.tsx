import { useOnClickOutside } from "lib/hooks/useOnClickOutside";
import { useContext, useRef, useState } from "react";
import style from './DefaultDropdown.module.scss'
import classNames from "classnames/bind";
import DownArrowIcon from "components/icons/DownArowIcon";
import * as ga from 'lib/utils/gTag';
import { useRouter } from "next/router";
import { handleUrl, parseUrl } from "lib/utils/UrlUtil";
import { EventContext } from "context/event";

const cn = classNames.bind(style);

type DefaultDropdownProps = {
  title: string;
  options: string[];
  type: string;
  context: (event: string | undefined) => void;
  gaParam: {
    action: string;
    event_category: string;
    event_label: string;
  }
}

function DefaultDropdown({ title, options, type, context, gaParam }: DefaultDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<string | undefined>(undefined);
  const { jobGroupList, eventType, location, coast } = useContext(EventContext)
  const outSideRef = useRef(null);
  const router = useRouter();
  const getCollectTitle = () => {
    if (type === "type") {
      if (currentState === undefined)
        return (eventType ? eventType : title);
      return (currentState);
    } else if (type === "location") {
      if (currentState === undefined)
        return (location ? location : title);
      return (currentState);
    } else if (type === "coast") {
      if (currentState === undefined)
        return (coast ? coast : title);
      return (currentState);
    }
    return (title);
  }
  const name = getCollectTitle();

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
            <span>{name !== '선택 안함' ? name : title}</span>
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
                  className={cn('dropdown__list__element')}
                  onClick={() => {
                    ga.event(gaParam)
                    const key = `${type}`
                    const value = `${option}`
                    if (option === "선택 안함") {
                      setCurrentState(undefined);
                      context(undefined);
                      router.replace(`${handleUrl(`${router.asPath}`, key, jobGroupList, eventType, location, coast)}`)
                    } else {
                      setCurrentState(option);
                      context(option)
                      router.replace(`${parseUrl(`${router.asPath}`, key, value, jobGroupList)}`)
                    }
                    setIsOpen(false);
                  }}>
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