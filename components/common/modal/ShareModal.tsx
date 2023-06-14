import classNames from 'classnames/bind';
import React, { useEffect } from 'react';
import style from './ShareModal.module.scss';
import Modal from 'react-modal';
import { MdContentCopy } from 'react-icons/md';

const cn = classNames.bind(style);

function ShareModal({ isOpen, onClick, data }: any) {
  return (
    <Modal isOpen={isOpen} className={cn('modal')} overlayClassName={cn('overlay')} onRequestClose={onClick}>
      <div className={cn('modal__title')}>행사 공유하기</div>
      <div className={cn('modal__content')}>
        {' '}
        <input className={cn('modal__content__link')} value={data.event_link} readOnly></input>
        <button
          className={cn('modal__content__button')}
          onClick={(event) => {
            const copyLink = data.event_link;
            navigator.clipboard
              .writeText(copyLink)
              .then(() => {
                alert('링크가 복사되었습니다');
              })
              .catch((err) => {
                console.log('링크복사 실패', err);
              });
          }}
        >
          <MdContentCopy color="#757575" size={20} />
        </button>
      </div>
    </Modal>
  );
}

export default ShareModal;
