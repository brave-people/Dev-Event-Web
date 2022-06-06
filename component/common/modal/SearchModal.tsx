import classNames from 'classnames/bind';
import React, { useEffect } from 'react';
import style from './SearchModal.module.scss';
import Modal from 'react-modal';
import { FiSearch } from 'react-icons/fi';
import router from 'next/router';

const cx = classNames.bind(style);

function SearchModal({ isOpen, onClick }: any) {
  const onSubmit = (event: any) => {
    const keyword = event.target.value;
    if (keyword) {
      router.replace(`/events?keyword=${keyword}`);
    } else {
      router.replace(`/events`);
    }
  };

  return (
    <Modal isOpen={isOpen} className={cx('modal')} overlayClassName={cx('overlay')} onRequestClose={onClick}>
      <div className={cx('modal__inner')}>
        <input className={cx('search-input')} placeholder="어떤 행사를 찾고 계세요?" onKeyPress={onSubmit}></input>
      </div>
    </Modal>
  );
}

export default SearchModal;
