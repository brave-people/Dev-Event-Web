import style from 'components/common/dropdown/BasicDropdown.module.scss';
import DownArrowIcon from 'components/icons/DownArowIcon';
import { EventContext } from 'context/event';
import { WindowContext } from 'context/window';
import { useOnClickOutside } from 'lib/hooks/useOnClickOutside';
import * as ga from 'lib/utils/gTag';
import { initUrl, parseUrl } from 'lib/utils/urlUtil';
import { useContext, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { useRouter } from 'next/router';

const cn = classNames.bind(style);

type BasicDropdownProps = {
  title: string;
  options: string[];
  type: string;
  context: (event: string | undefined) => void;
  gaParam: {
    action: string;
    event_category: string;
    event_label: string;
  };
};

function BasicDropdown({ title, options, type, context, gaParam }: BasicDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentState, setCurrentState] = useState<string | undefined>(undefined);
  const { jobGroupList, eventType, location, coast, search, date, url, handleDate, handleUrl } =
    useContext(EventContext);
  const { windowTheme } = useContext(WindowContext);
  const outSideRef = useRef(null);
  const router = useRouter();

  const getCollectTitle = () => {
    if (type === 'type') {
      if (currentState === undefined) return eventType ? eventType : title;
      return currentState;
    } else if (type === 'location') {
      if (currentState === undefined) return location ? location : title;
      return currentState;
    } else if (type === 'coast') {
      if (currentState === undefined) return coast ? coast : title;
      return currentState;
    }
    return title;
  };
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

  const checkContext = (current: string) => {
    if (type === 'type') return eventType === current;
    else if (type === 'location') return location === current;
    return coast === current;
  };

  const reflactUrl = (urls: string) => {
    const windowX = window.innerWidth;
    handleUrl(urls);
    if (windowX < 600) return;
    router.push(urls, undefined, { scroll: false });
  };

  useOnClickOutside({ ref: outSideRef, handler: handleClickOutside, mouseEvent: 'click' });
  return (
    <>
      <div className={cn('dropdown')} ref={outSideRef}>
        <div className={cn('dropdown__header', isOpen && 'dropdown__header__focus')} onClick={handleClickDropdown}>
          <span className={cn('dropdown__header__placeholder')}>
            <span>{name !== '전체' ? name : title}</span>
          </span>
          <DownArrowIcon color="rgba(49, 50, 52, 1)" className={isOpen ? 'active' : 'unactive'} />
        </div>
        {isOpen && (
          <div className={cn('dropdown__list')}>
            {options?.map((option, idx) => {
              return (
                <div
                  key={idx}
                  className={cn(
                    'dropdown__list__element',
                    checkContext(option) && `${windowTheme ? 'selected__light' : 'selected__dark'}`
                  )}
                  onClick={() => {
                    ga.event(gaParam);
                    const key = `${type}`;
                    const value = `${option}`;
                    if (date !== undefined) handleDate(undefined);
                    if (option === '전체') {
                      setCurrentState(undefined);
                      context(undefined);
                      setIsOpen(false);
                      reflactUrl(
                        `${initUrl(
                          `${url ? url : router.asPath}`,
                          key,
                          jobGroupList,
                          eventType,
                          location,
                          coast,
                          search
                        )}`
                      );
                    } else {
                      setCurrentState(option);
                      context(option);
                      setIsOpen(false);
                      reflactUrl(`${parseUrl(`${url ? url : router.asPath}`, key, value, jobGroupList)}`);
                    }
                  }}
                >
                  {option}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default BasicDropdown;
