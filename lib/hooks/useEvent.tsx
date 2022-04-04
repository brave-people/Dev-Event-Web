import { EventAPI as handler} from "lib/api/event"
import SWR from "swr"

interface EventSWR {
  events : any
  isLoading : boolean
  isError : any
  }

const useEvent :any = async (year : number, month : number)=>{
    const { data, error } = SWR(`/front/v1/events/${year}/${month}`, handler)
  
    return {
      events: data,
      isLoading: !error && !data,
      isError: error
    }
    }

  export  { useEvent };