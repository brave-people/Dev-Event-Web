import React, { createContext, ReactNode, useState } from 'react'

interface EventContext {
  jobGroupList: string[] | undefined;
  updateJobGroupList: (job: string | string[] | undefined) => void;
  deleteJobGroupList: (nJob: string) => void;
  initJobGroupList: () => void;
  eventType: string | undefined;
  handleEventType: (event: string | undefined) => void;
  location: string | undefined;
  handleLocation: (location: string | undefined) => void;
  coast: string | undefined;
  handleCoast: (coast: string | undefined) => void;
  date: string | undefined;
  handleDate: (date: string | undefined) => void;
}

const defaultValue: EventContext = {
  jobGroupList: undefined,
  updateJobGroupList: () => {},
  deleteJobGroupList: () => {},
  initJobGroupList: () => {},
  eventType: undefined,
  handleEventType: () => {},
  location: undefined,
  handleLocation: () => {},
  coast: undefined,
  handleCoast: () => {},
  date: undefined,
  handleDate: () => {}
}

const EventContext = createContext(defaultValue);

const EventProvider = ({ children }: { children: ReactNode }) => {
  const [jobGroupList, setJobGroupList] = useState<string[] | undefined>(undefined);
  const [eventType, setEventType] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [coast, setCoast] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<string | undefined>(undefined);
  const updateJobGroupList = (job: string | string[] | undefined) => {
    if (typeof(job) === "undefined")
      return ;
    if (typeof(job) === "string") {
      if (jobGroupList === undefined) {
        setJobGroupList([job]);
      } else {
        if (jobGroupList.includes(job) === false) {
          setJobGroupList(jobGroupList?.concat(job));
        }
      }
    } else {
      if (jobGroupList === undefined) {
        setJobGroupList(job)
      } else {
        for (let i = 0; i < job.length; i++) {
          if (jobGroupList.includes(job[i]) === false)
            setJobGroupList(jobGroupList?.concat(job[i]));
        }
      }
    }
  }

  const initJobGroupList = () => {
    setJobGroupList([]);
  }

  const deleteJobGroupList = (nJob: string) => {
    setJobGroupList(jobGroupList?.filter((job) => job !== nJob));
  }

  const handleEventType = (event: string | undefined) => {
    setEventType(event);
  }

  const handleLocation = (location: string | undefined) => {
    setLocation(location)
  }

  const handleCoast = (coast: string | undefined) => {
    setCoast(coast);
  }

  const handleDate = (date: string | undefined) => {
    setDate(date);
  }

  const contextValue = {
    jobGroupList,
    updateJobGroupList,
    deleteJobGroupList,
    initJobGroupList,
    eventType,
    handleEventType,
    location,
    handleLocation,
    coast,
    handleCoast,
    date,
    handleDate
  }
  return (
    <>
      <EventContext.Provider value={contextValue}>{children}</EventContext.Provider>
    </>
  )
}

export {
  EventContext,
  EventProvider
}