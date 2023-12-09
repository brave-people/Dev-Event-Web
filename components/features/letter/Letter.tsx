import FillButton from 'components/common/buttons/FillButton';
import style from 'components/features/letter/Letter.module.scss';
import classNames from 'classnames/bind';
import Image from 'next/image';
import Link from 'next/link';

const cn = classNames.bind(style);

const onClick = () => {
  return;
};

const Letter = () => {
  return (
    <section className={cn('letter')}>
      <div className={cn('inner')}>
        <div className={cn('letter__container')}>
          <div>
            <div className={cn('letter__title')}>
              매주
              <span>데브이벤트</span>
              <br className={cn('break__line')} />
              소식을 받아보세요
            </div>
            <div className={cn('letter__desc')}>
              일요일 저녁 8시 개발자 행사 소식을
              <br className={cn('break__line')} />
              메일로 보내드려요
            </div>
          </div>
          <div className={cn('image__container')}>
            <Image
              src="/icon/letter_icon.svg"
              alt="letter__icon"
              layout="fill"
              priority={true}
            />
          </div>
        </div>
        <Link href={'https://github.com/brave-people/Dev-Event-Subscribe'}>
          <a className={cn('button__container')} target="_blank">
            <FillButton
              onClick={onClick}
              label="무료 구독하기"
              color="primary"
              rounded={true}
            />
          </a>
        </Link>
      </div>
    </section>
  );
};

export default Letter;
