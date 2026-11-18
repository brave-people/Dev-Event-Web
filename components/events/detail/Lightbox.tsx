import { useEffect } from 'react';

import classNames from 'classnames/bind';
import Modal from 'react-modal';

import TimelineIcon from 'components/events/timeline/TimelineIcon';

import style from './Lightbox.module.scss';

const cn = classNames.bind(style);

export interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  image: LightboxImage | null;
  onClose: () => void;
}

function Lightbox({ image, onClose }: LightboxProps) {
  const isOpen = image !== null;

  useEffect(() => {
    if (!isOpen) return undefined;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={cn('content')}
      overlayClassName={cn('overlay')}
      contentLabel="그림 크게 보기"
    >
      {image && (
        <img
          className={cn('image')}
          src={image.src}
          alt={image.alt}
          onClick={onClose}
        />
      )}
      {image && (
        <button
          type="button"
          className={cn('close')}
          aria-label="닫기"
          onClick={onClose}
        >
          <TimelineIcon name="x" size={20} />
        </button>
      )}
    </Modal>
  );
}

export default Lightbox;
