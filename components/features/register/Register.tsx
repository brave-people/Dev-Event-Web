import React from 'react'
import Link from "next/link";
import * as ga from 'lib/utils/gTag';
import FillButton from "components/common/buttons/FillButton";
import style from 'components/features/register/Register.module.scss'
import classNames from 'classnames/bind';

const cn = classNames.bind(style)

function Register() {
  return (
    <Link href={'https://forms.gle/UUjUVg1tTrKhemKu9'}>
      <a target="__blank" className={cn('register')}>
        <FillButton
          label="행사 추가 요청"
          color="gray1"
          icon="plus"
          size='regular'
          iconStyle="register"
          onClick={() => {
            ga.event({
              action: 'web_event_행사등록버튼클릭',
              event_category: 'web_event',
              event_label: '행사등록',
            });
          }}
          rounded={false}
       />
    </a>
  </Link>
  )
}

export default Register;