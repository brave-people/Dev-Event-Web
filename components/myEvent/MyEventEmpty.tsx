import classNames from 'classnames/bind';
import Image from 'next/image';
import router from 'next/router';
import style from './MyEventEmpty.module.scss';

const cx = classNames.bind(style);

const MyEventEmpty = () => {
  const goEventPage = () => {
    router.push('/events');
  };

  return (
    <div className={cx('empty-event-container')}>
      <div className={cx('empty-event-container__inner')}>
        <div className={cx('empty-event-container__inner__title')}>저장한 행사가 없습니다.</div>
        <Image
          className={cx('empty-event-container__inner__icon')}
          src={'/icon/bookmark_icon.png'}
          width={88}
          height={88}
        />
        <div className={cx('empty-event-container__inner__info')}>관심있는 행사를 저장해보세요 </div>
        <button onClick={goEventPage} className={cx('empty-event-container__inner__button')}>
          개발자 행사 보러가기
        </button>
      </div>
    </div>
  );
};

export default MyEventEmpty;
