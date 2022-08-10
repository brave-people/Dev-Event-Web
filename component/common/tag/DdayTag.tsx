import classNames from 'classnames/bind';
import { DateUtil } from 'lib/utils/dateUtil';
import React from 'react';
import style from './DdayTag.module.scss';
const cn = classNames.bind(style);

interface props {
  startDateTime: string;
  endDateTime: string;
}

function DdayTag(props: props) {
  const calculateEventDday = () => {
    const todayDate = DateUtil.setDateTimeToDate();
    const startDate = DateUtil.setDateTimeToDate(props.startDateTime);
    const endDate = DateUtil.setDateTimeToDate(props.endDateTime);
    const ddayByStart = startDate.diff(todayDate, 'day');
    const ddayByEnd = endDate.diff(todayDate, 'day');

    if (ddayByStart > 0 && ddayByStart < 6) {
      return { type: 'approach', diff: ddayByStart };
    } else if (ddayByStart > 0) {
      return { type: 'scheduled', diff: ddayByStart };
    } else if (
      (ddayByStart < 0 && ddayByEnd > 0) ||
      (ddayByStart === 0 && startDate.get('day') === todayDate.get('day')) ||
      (ddayByEnd === 0 && endDate.get('day') === todayDate.get('day'))
    ) {
      return { type: 'ongoing', diff: 0 };
    } else {
      return { type: 'null', diff: 0 };
    }
  };

  const getEventDdayTag = () => {
    const type = calculateEventDday();

    switch (type.type) {
      case 'approach':
        return <span className={cn('tag--approach')}>D-{type.diff}</span>;
      case 'scheduled':
        return <span className={cn('tag--scheduled')}>D-{type.diff}</span>;
      case 'ongoing':
        return <span className={cn('tag--ongoing')}>Today</span>;
      default:
        return <span></span>;
    }
  };

  return <span className={cn('tag')}>{getEventDdayTag()}</span>;
}

export default DdayTag;
