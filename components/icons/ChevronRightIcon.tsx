import React from 'react';
import { Icon } from '../../types/Icon';

/**
 * 인라인 링크용 셰브론 (>).
 * RightArrowIcon 은 stroke 를 windowTheme 로 하드코딩해서 hover 색 변화를 따라가지 못한다.
 * 이 아이콘은 currentColor 를 써서 부모가 color 로 상태를 제어할 수 있다.
 */
function ChevronRightIcon({ className }: Icon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="m5.25 3.5 3.5 3.5-3.5 3.5"
      />
    </svg>
  );
}

export default ChevronRightIcon;
