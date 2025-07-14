import classNames from 'classnames/bind';
import { DateUtil } from 'lib/utils/dateUtil';
import React from 'react';
import style from 'components/common/tag/DdayTag.module.scss';

const cn = classNames.bind(style);

type Props = {
  startDateTime: string;
  endDateTime: string;
};

function DdayTag({ startDateTime, endDateTime }: Props) {
  const calculateEventDday = () => {
    const todayDate = DateUtil.setDateTimeToDate();
    const startDate = DateUtil.setDateTimeToDate(startDateTime);
    const endDate = DateUtil.setDateTimeToDate(endDateTime);
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
        return <div>D-{type.diff}</div>;
      case 'scheduled':
        return <div>D-{type.diff}</div>;
      case 'ongoing':
        return <div className={cn('tag--bold')}>Today</div>;
      default:
        return null;
    }
  };

  const tag = getEventDdayTag();
  return tag ? <div className={cn('tag')}>{tag}</div> : null;
}

export default DdayTag;
