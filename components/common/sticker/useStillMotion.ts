import { useEffect } from 'react';

// 움직임 줄이기를 켠 사용자에게는 SVG 안의 움직임(<animate>·<animateTransform>)을 멈춘다.
// CSS 미디어쿼리로는 SVG 안의 움직임을 멈출 수 없어서 여기서 처리한다.
// 화면이 떠 있는 동안 설정이 바뀌는 것은 따라가지 않는다.
export default function useStillMotion(ref: React.RefObject<Element>): void {
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof window.matchMedia !== 'function') return;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets: Element[] = [];
    if (root.tagName.toLowerCase() === 'svg') {
      targets.push(root);
    } else {
      const found = root.querySelectorAll('svg');
      for (let i = 0; i < found.length; i += 1) targets.push(found[i]);
    }
    targets.forEach((el) => {
      const target = el as SVGSVGElement;
      if (typeof target.pauseAnimations !== 'function') return;
      target.pauseAnimations();
      if (typeof target.setCurrentTime === 'function') target.setCurrentTime(0);
    });
  }, []);
}
