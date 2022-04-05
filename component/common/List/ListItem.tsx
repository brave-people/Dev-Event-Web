import React from 'react'
import Link from 'next/link'
import {Event} from 'interfaces/index'

type ListItemProps = {
   data: Event
  }

const ListItem = ({data}: any) => {
  console.log(data)
    return <div><Link href={String(data.event_link)}>
    <a>
     <div>
    <span>이벤트 제목 :{data.title}</span> <br/>
    <span>이벤트 세부사항 : {data.description}</span> <br/>
    <span> 이벤트 주최자 : {data.organizer} </span><br/>
      </div> 
    </a>
  </Link></div>  
}
export default ListItem;