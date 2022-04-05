import { EventAPI} from "lib/api/event"
import useSWR from "swr"

interface Date {
  year : number
  month : number
  }

const useEventSWR :any = ( param : Date, )=>{
    const { data:events, error } = useSWR([`/front/v1/events/${param.year}/${param.month}`, param], EventAPI.fetchEvents )
    return  {
      events: events,
      isLoading: !error && !events,
      isError: error
    }
    }

  export  { useEventSWR };