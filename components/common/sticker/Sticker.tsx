import { useRef } from 'react';
import classNames from 'classnames/bind';

import { StickerName, stickerSvg } from 'lib/sticker/art';
import useStillMotion from 'components/common/sticker/useStillMotion';

import style from './Sticker.module.scss';

const cn = classNames.bind(style);

export type StickerPlacement = {
  name: StickerName;
  x: number; // 붙는 쪽 끝에서의 거리 (px)
  y: number; // 위에서의 거리 (px)
  rotate: number; // 기울기 (도)
  scale: number; // 크기 배율
  side?: 'left' | 'right'; // 붙는 쪽. 넘기지 않으면 'left'
};

export default function Sticker({
  name,
  x,
  y,
  rotate,
  scale,
  side = 'left',
  className,
}: StickerPlacement & { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useStillMotion(ref);

  return (
    <span
      ref={ref}
      className={cn('sticker', { right: side === 'right' }, className)}
      style={
        {
          [side]: `${x}px`,
          top: `${y}px`,
          '--r': `${rotate}deg`,
          '--s': scale,
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: stickerSvg(name) }}
    />
  );
}
