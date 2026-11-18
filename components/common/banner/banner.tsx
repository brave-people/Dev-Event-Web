import HoloBanner from 'components/common/banner/HoloBanner';
import RegisteredBanner from 'components/common/banner/RegisteredBanner';
import { useTopBanners } from 'lib/hooks/useSWR';
import { TopBanner } from 'model/banner';

interface BannerProps {
  fallbackData?: TopBanner[];
}

function Banner({ fallbackData }: BannerProps) {
  const { topBanners } = useTopBanners(fallbackData);

  return topBanners.length > 0 ? (
    <RegisteredBanner banners={topBanners} />
  ) : (
    <HoloBanner />
  );
}

export default Banner;
