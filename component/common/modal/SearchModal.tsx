import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import style from './SearchModal.module.scss';
import Modal from 'react-modal';
import { FiSearch } from 'react-icons/fi';
import router from 'next/router';

const cx = classNames.bind(style);

function SearchModal({ isOpen, onClick }: any) {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setInput('');
    }
  }, [isOpen]);

  const onSubmit = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.code == 'Enter') {
      if (input) {
        router.replace(`/events?keyword=${input}`);
      } else {
        router.replace(`/events`);
      }
    }
  };

  const onChangeKeyword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  return (
    <Modal isOpen={isOpen} className={cx('modal')} overlayClassName={cx('overlay')} onRequestClose={onClick}>
      <div className={cx('modal__inner')}>
        <input
          className={cx('search-input')}
          placeholder="어떤 행사를 찾고 계세요?"
          onChange={onChangeKeyword}
          value={input}
          onKeyPress={onSubmit}
        ></input>
      </div>
    </Modal>
  );
}

export default SearchModal;
