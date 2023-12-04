import style from 'components/common/modal/DeleteAccountModal.module.scss';
import React from 'react';
import Modal from 'react-modal';
import classNames from 'classnames/bind';
import WithdrawOkButton from '../buttons/WithdrawOkButton';
import WithdrawCancelButton from '../buttons/WithdrawCancelButton';

const cx = classNames.bind(style);

function DeleteAccountModal({ isOpen, onClick, onCancel }: any) {
  return (
    <Modal
      isOpen={isOpen}
      className={cx('modal')}
      overlayClassName={cx('overlay')}
      onRequestClose={onClick}
    >
      <span className={cx('modal__title')}>정말 탈퇴하시겠습니까?</span>
      <span className={cx('modal__desc')}>
        탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다.
        <br /> 삭제된 정보는 다시 복구할 수 없습니다.
      </span>
      <div className={cx('modal__buttons')}>
        {/* 탈퇴 버튼 */}
        <WithdrawOkButton />
        {/* 탈퇴 취소 버튼 */}
        <WithdrawCancelButton />
      </div>

      {/*<div className={cx('modal__buttons')}>*/}
      {/*<OutlineButton label="취소하기" color="grey" onClick={onCancel} />*/}
        {/*<div className={cx('wrapper')}>*/}
        {/*  <FillButton*/}
        {/*    onClick={onClick}*/}
        {/*    label="탈퇴하기"*/}
        {/*    color="error"*/}
        {/*    rounded={false}*/}
        {/*  />*/}
        {/*</div>*/}
      {/*</div>*/}
    </Modal>
  );
}

export default DeleteAccountModal;
