import type { NextPage } from 'next'
import {useEventSWR} from "lib/hooks/useEvent"
import ListItem from 'component/common/List/ListItem';
import { useEffect, useState } from 'react';
import axios from 'axios';
const Home: NextPage = () => {
  // const { events, isLoading, isError } = useEventSWR(22,3);
  const [events, setEvents] = useState([]);
  useEffect (()=>{
    async function fetchAndSetUser() { 
    const year = 2022;
    const month =3;
    const result : any = await axios.get(`${process.env.BASE_SERVER_URL}/front/v1/events/${year}/${month}`,{params : {year : 2022, month : 3}})
    setEvents(result.data);
    }
    fetchAndSetUser();
  },[])
  
  return (
    <div>
      {events&& events.map((event:any)=>{
        return <ListItem key={event.id} data={event}/>
      })}
    </div>
  )
}

export default Home;