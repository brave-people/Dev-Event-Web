import classNames from 'classnames/bind';
import style from './EventDetailTagButton.module.scss';

const cn = classNames.bind(style);

type Button = {
  tagName: string;
};

const EventDetailTagButton = ({ tagName }: Button) => {
  return <button className={cn(`event-tag-button`)}>{tagName}</button>;
};

export default EventDetailTagButton;
