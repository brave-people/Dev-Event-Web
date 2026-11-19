import { TopBanner } from 'model/banner';
import { TOP_BANNER_PATH, usableBanners } from 'lib/utils/banner/topBanner';

export const TOP_BANNER_TIMEOUT_MS = 2000;

// getServerSideProps에서만 부른다. 실패하거나 늦어도 던지지 않고 빈 배열을 돌려준다.
export const fetchTopBannersOnServer = async (
  timeoutMs: number = TOP_BANNER_TIMEOUT_MS
): Promise<TopBanner[]> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(
      `${process.env.BASE_SERVER_URL}${TOP_BANNER_PATH}`,
      { signal: controller.signal }
    );
    if (!response.ok) return [];
    return usableBanners(await response.json());
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
};
