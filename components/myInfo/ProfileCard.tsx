import { useEffect, useState } from 'react';

import classNames from 'classnames/bind';
import Image from 'next/image';

import Sticker from 'components/common/sticker/Sticker';
import { ME_BAND } from 'components/common/sticker/stickerSets';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { avatarInitial, joinedText } from 'lib/utils/mypage/profile';
import { User } from 'model/auth';

import style from './ProfileCard.module.scss';

const cn = classNames.bind(style);

interface ProfileCardProps {
  user: User | undefined; // 불러오는 동안에는 undefined
  onWithdraw: () => void; // "회원 탈퇴" 누름
}

function Avatar({ user }: { user: User | undefined }) {
  const link = user?.profile_image_link;
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    setBroken(false);
  }, [link]);

  return (
    <span className={cn('avatar')}>
      {link && !broken ? (
        <Image
          src={link}
          width={96}
          height={96}
          alt="프로필 이미지"
          unoptimized
          objectFit="cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span aria-hidden="true">{avatarInitial(user?.username)}</span>
      )}
    </span>
  );
}

function ProfileCard({ user, onWithdraw }: ProfileCardProps) {
  const since = joinedText(user?.register_date);

  return (
    <section className={cn('card')}>
      <div className={cn('band')} aria-hidden="true">
        {ME_BAND.map((placement) => (
          <Sticker key={placement.name} {...placement} />
        ))}
      </div>
      <div className={cn('body')}>
        <Avatar user={user} />
        <h1 className={cn('name')}>{user?.username}</h1>
        {since && <p className={cn('since')}>{since}</p>}
        <dl className={cn('rows')}>
          <div className={cn('row')}>
            <dt>가입 계정</dt>
            <dd>
              <span className={cn('mail')}>
                <TimelineIcon name="mail" size={17} />
                {user?.email}
              </span>
            </dd>
          </div>
        </dl>
        <div className={cn('danger')}>
          <span>
            탈퇴하면 내 정보와 담아 둔 행사가 모두 삭제되고 복구할 수 없어요.
          </span>
          <button type="button" className={cn('withdraw')} onClick={onWithdraw}>
            회원 탈퇴
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProfileCard;
