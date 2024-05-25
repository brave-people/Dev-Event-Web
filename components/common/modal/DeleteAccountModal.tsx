import style from 'components/common/modal/DeleteAccountModal.module.scss';
import React from 'react';
import Modal from 'react-modal';
import classNames from 'classnames/bind';
import WithdrawCancelButton from '../buttons/WithdrawCancelButton';
import WithdrawOkButton from '../buttons/WithdrawOkButton';

const cx = classNames.bind(style);

export interface DeleteAccountModalProps {
  isOpen?: boolean;
  onClick?: () => void;
  onCancel?: () => void;
}

function DeleteAccountModal({
  isOpen,
  onClick,
  onCancel,
}: DeleteAccountModalProps) {
  return (
    <Modal
      isOpen={isOpen as boolean}
      className={cx('modal')}
      overlayClassName={cx('overlay')}
      onRequestClose={onCancel}
    >
      <span className={cx('modal__title')}>정말 탈퇴하시겠습니까?</span>
      <span className={cx('modal__desc')}>
        탈퇴를 하시면 회원님의 모든 정보가 삭제됩니다.
        <br /> 삭제된 정보는 다시 복구할 수 없습니다.
      </span>
      <div className={cx('modal__buttons')}>
        {/* 탈퇴 버튼 */}
        <WithdrawOkButton onClick={onClick} />
        {/* 탈퇴 취소 버튼 */}
        <WithdrawCancelButton onRequestClose={onCancel} />
      </div>
    </Modal>
  );
}

export default DeleteAccountModal;
