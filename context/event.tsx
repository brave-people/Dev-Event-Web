import React, { createContext, ReactNode, useState } from 'react'

interface EventContext {
  jobGroupList: string[] | undefined;
  updateJobGroupList: (job: string) => void;
  deleteJobGroupList: (nJob: string) => void;
  eventType: string | undefined;
  handleEventType: (event: string) => void;
  location: string | undefined;
  handleLocation: (location: string) => void;
  coast: string | undefined;
  handleCoast: (coast: string) => void;
}

const defaultValue: EventContext = {
  jobGroupList: undefined,
  updateJobGroupList: () => {},
  deleteJobGroupList: () => {},
  eventType: undefined,
  handleEventType: () => {},
  location: undefined,
  handleLocation: () => {},
  coast: undefined,
  handleCoast: () => {}
}

const EventContext = createContext(defaultValue);

const EventProvider = ({ children }: { children: ReactNode }) => {
  const [jobGroupList, setJobGroupList] = useState<string[] | undefined>(undefined);
  const [eventType, setEventType] = useState<string | undefined>(undefined);
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [coast, setCoast] = useState<string | undefined>(undefined);

  const updateJobGroupList = (job: string) => {
    if (jobGroupList === undefined) {
      setJobGroupList([job]);
    } else {
      setJobGroupList(jobGroupList?.concat(job));
    }
  }

  const deleteJobGroupList = (nJob: string) => {
    setJobGroupList(jobGroupList?.filter((job) => job !== nJob));
  }

  const handleEventType = (event: string) => {
    setEventType(event);
  }

  const handleLocation = (location: string) => {
    setLocation(location)
  }

  const handleCoast = (coast: string) => {
    setCoast(coast);
  }

  const contextValue = {
    jobGroupList,
    updateJobGroupList,
    deleteJobGroupList,
    eventType,
    handleEventType,
    location,
    handleLocation,
    coast,
    handleCoast
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