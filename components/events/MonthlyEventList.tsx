import React, { useState, useContext, useEffect } from "react";
import { EventResponse, Event } from "model/event";
import { Calender } from "model/calender";
import axios from "axios";
import { EventContext } from "context/event";
import List from "components/common/list/list";
import EventFilter from "components/features/filters/EventFilter";
import { ThreeDots } from "react-loader-spinner";
import classNames from 'classnames/bind';
import style from 'components/common/item/ItemList.module.scss'
import { checkCondition, checkDate } from "lib/utils/eventUtil";
import { checkSearch } from "lib/utils/searchUtil";
import EventNull from "components/common/modal/EventNull";

const cn = classNames.bind(style);

type Props = {
  fallbackData: EventResponse[];
  date: string;
}

function MonthlyEventList({ fallbackData, date } : Props) {
  const year = parseInt(date.slice(0, 4));
  const month = parseInt(date.slice(6, 8));  
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [dateParam, setDateParam] = useState<Calender>({ year, month });
  const [events, setEvents] = useState<Event[] | undefined>(undefined);
  const { jobGroupList, eventType, location, coast, search } = useContext(EventContext)
  
  const fetchEventByDate = async () => {
    try {
      const response = await axios.get(`${process.env.BASE_SERVER_URL}/front/v2/events/${year}/${month}`);
      const filteredEvent = response.data.filter((event: Event) => {
        return (checkCondition(jobGroupList?.join(', '), eventType, location, coast, event)
        && checkSearch(search, event))
      })
      setEvents(filteredEvent);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
    fetchEventByDate();
    setDateParam({
      year: year,
      month: month
    })
  }, [year, month, search, date]);

  return (
    <>
      <EventFilter />
      {isLoading ? (
        <div className={cn('null-container')}>
          <ThreeDots color="#479EF1" height={60} width={60} />
        </div>
      ) : ( events ? (
        <div className={cn('section__list')}>
          <div className={cn('section__list__title')}>
            <span>{`${year}년 ${month}월`}</span>
          </div>
          <List data={events} /> 
        </div> 
      ) : (
        <div>
          <EventNull />
        </div>
      ))}
    </>
  )
}

export default MonthlyEventList;