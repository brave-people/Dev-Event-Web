import classNames from 'classnames/bind';

import Sticker from 'components/common/sticker/Sticker';
import { LOGIN_BAND } from 'components/common/sticker/stickerSets';

import style from './LoginBand.module.scss';

const cn = classNames.bind(style);

// 좁은 창(360px 이하)에서 겹쳐 보이는 가운데 두 장
const HIDE_NARROW: string[] = ['lg:js:hex:h', 'laptop'];

function LoginBand() {
  return (
    <div className={cn('band')} aria-hidden="true">
      {LOGIN_BAND.map((placement, index) => (
        <Sticker
          key={index}
          {...placement}
          className={
            HIDE_NARROW.includes(placement.name) ? cn('hideNarrow') : undefined
          }
        />
      ))}
    </div>
  );
}

export default LoginBand;
