import classNames from 'classnames/bind';

import Sticker from 'components/common/sticker/Sticker';
import { BANNER_HOLO1 } from 'components/common/sticker/stickerSets';
import { buildHoloGroups } from 'components/common/banner/holoLayout';

import style from './HoloBanner.module.scss';

const cn = classNames.bind(style);

const GROUPS = buildHoloGroups(BANNER_HOLO1);

function HoloBanner() {
  return (
    <section className={cn('holo')}>
      <div className={cn('stickers')} aria-hidden="true">
        <div className={cn('group', 'pc')}>
          {GROUPS.pc.map((p) => (
            <Sticker key={p.name} {...p} />
          ))}
        </div>
        <div className={cn('group', 'wide')}>
          {GROUPS.wide.map((p) => (
            <Sticker key={p.name} {...p} />
          ))}
        </div>
        <div className={cn('group', 'tablet')}>
          {GROUPS.tablet.map((p) => (
            <Sticker key={p.name} {...p} />
          ))}
        </div>
        <div className={cn('group', 'mobile')}>
          {GROUPS.mobile.map((p) => (
            <Sticker key={p.name} {...p} />
          ))}
        </div>
      </div>
      <div className={cn('copy')}>
        <h1 className={cn('title')}>
          개발자 행사는
          <br /> 모두 <em className={cn('accent')}>Dev Event 웹</em>에서
        </h1>
        <p className={cn('desc')}>
          진행 중인 행사부터 종료된 행사까지, 놓치지 마세요!
        </p>
      </div>
    </section>
  );
}

export default HoloBanner;
