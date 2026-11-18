import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames/bind';
import LoginModal from 'components/common/modal/LoginModal';
import { useToast } from 'context/toast';
import { Event } from 'model/event';
import TimelineIcon from 'components/events/timeline/TimelineIcon';
import { useFavorite } from 'lib/hooks/useFavorite';
import { useNow } from 'lib/hooks/useNow';
import { describeApply } from 'lib/utils/detail/applyCard';
import { RelatedPick } from 'lib/utils/detail/related';
import ApplyCard from './ApplyCard';
import DetailBody from './DetailBody';
import DetailHead from './DetailHead';
import DetailPoster from './DetailPoster';
import Lightbox, { LightboxImage } from './Lightbox';
import MobileApplyBar from './MobileApplyBar';
import RelatedEvents from './RelatedEvents';
import style from './EventDetailView.module.scss';

const cn = classNames.bind(style);

interface EventDetailViewProps {
  event: Event;
  related: RelatedPick | null;
  now: string;
}

function EventDetailView({
  event,
  related,
  now: initialNow,
}: EventDetailViewProps) {
  const now = useNow(initialNow);
  const { pushToast } = useToast();
  const { isFavorite, toggleFavorite, loginModalIsOpen, closeLoginModal } =
    useFavorite();
  const [zoom, setZoom] = useState<LightboxImage | null>(null);

  const info = useMemo(() => describeApply(event, now), [event, now]);
  const favorite = isFavorite(event.id);

  const onToggleFavorite = useCallback(() => {
    toggleFavorite(event);
  }, [toggleFavorite, event]);

  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      pushToast('링크가 복사되었어요');
    } catch (err) {
      console.error(err);
      pushToast('링크 복사에 실패했어요', 'plain');
    }
  }, [pushToast]);

  const closeZoom = useCallback(() => setZoom(null), []);

  return (
    <>
      <div className={cn('wrap')}>
        <Link href="/events">
          <a className={cn('back')}>
            <TimelineIcon name="back" size={16} /> 행사 일정
          </a>
        </Link>
        <div className={cn('grid')}>
          <aside className={cn('side')}>
            <DetailPoster event={event} onZoom={setZoom} />
            <ApplyCard
              event={event}
              info={info}
              favorite={favorite}
              onToggleFavorite={onToggleFavorite}
              onShare={share}
            />
          </aside>
          <div className={cn('main')}>
            <DetailHead event={event} now={now} />
            <DetailBody event={event} onZoom={setZoom} />
            <RelatedEvents related={related} now={now} />
          </div>
        </div>
      </div>
      <MobileApplyBar
        event={event}
        info={info}
        favorite={favorite}
        onToggleFavorite={onToggleFavorite}
      />
      <Lightbox image={zoom} onClose={closeZoom} />
      <LoginModal isOpen={loginModalIsOpen} onClose={closeLoginModal} />
    </>
  );
}

export default EventDetailView;
