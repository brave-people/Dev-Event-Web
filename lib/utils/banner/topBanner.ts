import { TopBanner } from 'model/banner';
import { SITE_URL } from 'lib/seo/site';

export const TOP_BANNER_PATH = '/banner/top';

export const usableBanners = (data: unknown): TopBanner[] => {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is TopBanner =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as { title?: unknown }).title === 'string' &&
      (item as { title: string }).title.trim() !== ''
  );
};

export interface BannerLink {
  href: string;
  external: boolean;
}

// 안쪽 경로로 쓸 수 있는가: "/"로 시작하고 둘째 글자가 "/"나 "\\"가 아니어야 한다.
const isSafePath = (path: string): boolean =>
  path.charAt(0) === '/' && path.charAt(1) !== '/' && path.charAt(1) !== '\\';

export const bannerLink = (
  value: unknown,
  siteUrl: string = SITE_URL
): BannerLink | null => {
  if (typeof value !== 'string') return null;
  const href = value.trim();
  if (!href) return null;
  // 브라우저는 주소 안의 탭·개행을 지우므로 제어 문자가 있으면 쓰지 않는다.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(href)) return null;

  if (href.charAt(0) === '/') {
    return isSafePath(href) ? { href, external: false } : null;
  }

  if (/^https?:\/\//i.test(href)) {
    if (href.toLowerCase().indexOf(siteUrl.toLowerCase()) === 0) {
      const rest = href.slice(siteUrl.length);
      if (rest === '') return { href: '/', external: false };
      if (/^[/?#]/.test(rest)) {
        const path = rest.charAt(0) === '/' ? rest : `/${rest}`;
        return isSafePath(path) ? { href: path, external: false } : null;
      }
    }
    return { href, external: true };
  }

  return null;
};

export const stepBanner = (
  index: number,
  delta: -1 | 0 | 1,
  count: number
): number => {
  if (count <= 1) return 0;
  const folded = Math.min(Math.max(index, 0), count - 1);
  return (folded + delta + count) % count;
};
