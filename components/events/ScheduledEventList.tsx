import React from 'react';
import { EventResponse } from 'model/event';
import ItemList from 'components/common/item/ItemList';

type Props = {
  fallbackData: EventResponse[];
}

const ScheduledEventList = ({ fallbackData }: Props) => {
  return (
    <>
      <ItemList
        fallbackData={fallbackData}
      />
    </>
  )
};
export default ScheduledEventList;
