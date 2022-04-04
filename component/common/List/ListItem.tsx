import React from 'react'
import Link from 'next/link'
import {Event} from 'interfaces/index'

type ListItemProps = {
   data: Event
  }

const ListItem = ({data}: ListItemProps) => {
    return   <Link href={data.event_link}>
    <a>
      {data.title}: {data.description} : {data.organizer} 
    </a>
  </Link>
}
export default ListItem;