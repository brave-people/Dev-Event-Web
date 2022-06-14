import classNames from 'classnames/bind';
import React, { useEffect } from 'react';
import style from './DeleteAccountModal.module.scss';
import Modal from 'react-modal';
import FillButton from '../buttons/FillButton';
import OutlineButton from '../buttons/OutlineButton';

const cx = classNames.bind(style);

function DeleteAccountModal({ isOpen, onClick, onCancel }: any) {
  return (
    <Modal isOpen={isOpen} className={cx('modal')} overlayClassName={cx('overlay')} onRequestClose={onClick}>
      <span className={cx('modal__title')}>정말 탈퇴하시겠습니까?</span>
      <span className={cx('modal__desc')}>
        탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다.
        <br /> 삭제된 정보는 다시 복구할 수 없습니다.
      </span>
      <div className={cx('modal__buttons')}>
        <OutlineButton label="취소하기" color="grey" onClick={onCancel}></OutlineButton>
        <div className={cx('wrapper')}>
          <FillButton label="탈퇴하기" color="error" onClick={onClick}></FillButton>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteAccountModal;
