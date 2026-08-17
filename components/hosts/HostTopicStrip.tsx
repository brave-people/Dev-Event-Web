import style from 'components/hosts/HostTopicStrip.module.scss';
import { HostTopic } from 'model/host';
import { useRouter } from 'next/router';
import classNames from 'classnames/bind';

const cn = classNames.bind(style);

type Props = {
  topics: HostTopic[];
};

/**
 * 자주 다룬 주제 칩.
 * 이미 button 으로 렌더되고 hover 인터랙션 스타일이 있어 '눌리는 것처럼' 보이므로,
 * span 으로 강등하는 대신 **행사 검색으로 이동**하는 실제 동작을 붙였다 (WEB-030 / DES-102 → 선택지 A).
 */
const HostTopicStrip = ({ topics }: Props) => {
  const router = useRouter();

  if (topics.length === 0) return null;

  const moveToSearch = (topic: HostTopic) => {
    router.push(`/events?search=${encodeURIComponent(topic.name)}`);
  };

  return (
    <section className={cn('wrap')}>
      <div className={cn('head')}>
        <h2 className={cn('title')}>자주 다룬 주제</h2>
      </div>
      <div className={cn('strip')}>
        {topics.map((topic) => (
          <button
            key={topic.name}
            className={cn('chip')}
            type="button"
            aria-label={`${topic.name} 관련 행사 검색`}
            onClick={() => moveToSearch(topic)}
          >
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
