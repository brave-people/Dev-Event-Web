import style from 'components/features/letter/Letter.module.scss';
import classNames from 'classnames/bind';
import Image from 'next/image';
import Link from 'next/link';
import EmailSubscribeButton from '../../common/buttons/EmailSubscribeButton';

const cn = classNames.bind(style);

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
              일요일 저녁 8시 개발자 행사 소식을{' '}
              <br className={cn('break__line')} />
              메일로 보내드려요
            </div>
          </div>
          <div className={cn('image__container')}>
            <Image
              src="/icon/letter_icon.svg"
              width={146}
              height={140}
              alt="letter__icon"
              layout="fill"
              priority={true}
            />
          </div>
          <Link href={'https://github.com/brave-people/Dev-Event-Subscribe'}>
            <a className={cn('email_button_container')} target="_blank">
              <EmailSubscribeButton />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Letter;
