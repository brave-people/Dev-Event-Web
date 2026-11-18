import { useRef } from 'react';

import { STICKER_DEFS } from 'lib/sticker/art';
import useStillMotion from 'components/common/sticker/useStillMotion';

// 스티커가 url(#stk-…)로 가리키는 색·필터 정의. Layout 에서 한 번만 그린다.
// 화면에서 숨기면 브라우저에 따라 정의가 듣지 않아, 크기 0 으로 두고 위치만 뺀다.
export default function StickerDefs() {
  const ref = useRef<SVGSVGElement>(null);
  useStillMotion(ref);

  return (
    <svg
      ref={ref}
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
      focusable="false"
    >
      <defs dangerouslySetInnerHTML={{ __html: STICKER_DEFS }} />
    </svg>
  );
}
