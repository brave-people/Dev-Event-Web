import classNames from 'classnames/bind';
import React, { useEffect } from 'react';
import style from './SearchModal.module.scss';
import Modal from 'react-modal';
import { FiSearch } from 'react-icons/fi';

const cx = classNames.bind(style);

function SearchModal({ isOpen, onClick }: any) {
  return (
    <Modal isOpen={isOpen} className={cx('modal')} overlayClassName={cx('overlay')} onRequestClose={onClick}>
      <div className={cx('modal__inner')}>
        <input className={cx('search-input')} placeholder="어떤 행사를 찾고 계세요?"></input>
        <span className={cx('search-input__icon')}>
          <FiSearch color="#95969c" size={50} />
        </span>
      </div>
    </Modal>
  );
}

export default SearchModal;
