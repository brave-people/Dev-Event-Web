import classNames from 'classnames/bind';
import style from './EventDetailMoveButton.module.scss';

const cn = classNames.bind(style);

const EventDetailMoveButton = () => {
  return <button className={cn(`event_move`)}>참여하기</button>;
};

export default EventDetailMoveButton;
