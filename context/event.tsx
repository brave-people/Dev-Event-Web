import React, { createContext, ReactNode, useState } from 'react';

interface EventContext {
  jobGroupList: string[] | undefined;
  initJobGroupList: () => void;
  eventType: string | undefined;
  handleEventType: (event: string | undefined) => void;
  location: string | undefined;
  handleLocation: (location: string | undefined) => void;
  coast: string | undefined;
  handleCoast: (coast: string | undefined) => void;
  date: string | undefined;
  handleDate: (date: string | undefined) => void;
  search: string | undefined;
  handleSearch: (search: string | undefined) => void;
  url: string | undefined;
  handleUrl: (url: string | undefined) => void;
  newOnly: boolean;
  handleNewOnly: (value: boolean) => void;
  showPast: boolean;
  handleShowPast: (value: boolean) => void;
  replaceJobGroupList: (list: string[]) => void;
  focusDay: string | null;
  handleFocusDay: (key: string | null) => void;
}

// Provider 밖에서 부르면 아무것도 하지 않는다
const noop = (): void => undefined;

const defaultValue: EventContext = {
  jobGroupList: undefined,
  initJobGroupList: noop,
  eventType: undefined,
  handleEventType: noop,
  location: undefined,
  handleLocation: noop,
  coast: undefined,
  handleCoast: noop,
  date: undefined,
  handleDate: noop,
  search: undefined,
  handleSearch: noop,
  url: '',
  handleUrl: noop,
  newOnly: false,
  handleNewOnly: noop,
  showPast: false,
  handleShowPast: noop,
  replaceJobGroupList: noop,
  focusDay: null,
  handleFocusDay: noop,
};

const EventContext = createContext(defaultValue);

const EventProvider = ({ children }: { children: ReactNode }) => {
  const [jobGroupList, setJobGroupList] = useState<string[] | undefined>(
    undefined
  );
  const [eventType, setEventType] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [coast, setCoast] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [newOnly, setNewOnly] = useState<boolean>(false);
  const [showPast, setShowPast] = useState<boolean>(false);
  const [focusDay, setFocusDay] = useState<string | null>(null);

  const initJobGroupList = () => {
    setJobGroupList([]);
  };

  const handleEventType = (event: string | undefined) => {
    setEventType(event);
  };

  const handleLocation = (location: string | undefined) => {
    setLocation(location);
  };

  const handleCoast = (coast: string | undefined) => {
    setCoast(coast);
  };

  const handleDate = (date: string | undefined) => {
    setDate(date);
  };

  const handleSearch = (search: string | undefined) => {
    setSearch(search);
  };

  const handleUrl = (url: string | undefined) => {
    setUrl(url);
  };

  const handleNewOnly = (value: boolean) => {
    setNewOnly(value);
  };

  const handleShowPast = (value: boolean) => {
    setShowPast(value);
  };

  const replaceJobGroupList = (list: string[]) => {
    setJobGroupList(list);
  };

  const handleFocusDay = (key: string | null) => {
    setFocusDay(key);
  };

  const contextValue = {
    jobGroupList,
    initJobGroupList,
    eventType,
    handleEventType,
    location,
    handleLocation,
    coast,
    handleCoast,
    date,
    handleDate,
    search,
    handleSearch,
    url,
    handleUrl,
    newOnly,
    handleNewOnly,
    showPast,
    handleShowPast,
    replaceJobGroupList,
    focusDay,
    handleFocusDay,
  };
  return (
    <>
      <EventContext.Provider value={contextValue}>
        {children}
      </EventContext.Provider>
    </>
  );
};

export { EventContext, EventProvider };
