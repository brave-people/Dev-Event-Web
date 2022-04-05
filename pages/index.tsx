import type { NextPage } from 'next'
import {useEventSWR} from "lib/hooks/useEventSWR"
import ListItem from 'component/common/List/ListItem';
import { useState } from 'react';

const Home: NextPage = () => {
   const [date, setDate] = useState({year:2022,
    month:3});
  
   
  const { events, isLoading, isError } =  useEventSWR(date);

  return (
   <div>
     {events&& events.data.map((event:any)=>{
        return <ListItem key={event.id} data={event}/>
      })}
   </div>   

  )
}

  
export default Home;