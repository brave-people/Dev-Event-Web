import React from 'react';

import classNames from 'classnames/bind';

import Sticker from 'components/common/sticker/Sticker';
import { SAVED_BAND } from 'components/common/sticker/stickerSets';

import style from './SavedBand.module.scss';

const cn = classNames.bind(style);

interface SavedBandProps {
  children: React.ReactNode;
}

function SavedBand({ children }: SavedBandProps) {
  return (
    <div className={cn('band')}>
      <div className={cn('stickers')} aria-hidden="true">
        {SAVED_BAND.map((placement) => (
          <Sticker key={placement.name} {...placement} />
        ))}
      </div>
      <div className={cn('inner')}>{children}</div>
    </div>
  );
}

export default SavedBand;
