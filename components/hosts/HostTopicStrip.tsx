import style from 'components/hosts/HostTopicStrip.module.scss';
import { HostTopic } from 'model/host';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  topics: HostTopic[];
};

const HostTopicStrip = ({ topics }: Props) => {
  if (topics.length === 0) return null;
  return (
    <section className={cn('wrap')}>
      <div className={cn('head')}>
        <h2 className={cn('title')}>자주 다룬 주제</h2>
      </div>
      <div className={cn('strip')}>
        {topics.map((topic) => (
          <button key={topic.name} className={cn('chip')} type="button">
            {topic.name}
            {topic.count !== null && (
              <span className={cn('chip__count')}>{topic.count}</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default HostTopicStrip;
