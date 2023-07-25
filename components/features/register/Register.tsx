import React, { useContext, useEffect } from 'react'
import Link from "next/link";
import * as ga from 'lib/utils/gTag';
import FillButton from "components/common/buttons/FillButton";
import { FilledPlusIcon } from "components/icons";
import { WindowContext } from "context/window";

function Register() {
  const { windowX, handleWindowX } = useContext(WindowContext)
  useEffect(() => {
    handleWindowX(window.innerWidth);
  }, [windowX])
  return (
    <Link href={'https://forms.gle/UUjUVg1tTrKhemKu9'}>
    <a target="__blank">
      {windowX >= 400 ? (
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
      ): (
        <FilledPlusIcon
          color="#333"
        />
      )}
    </a>
  </Link>
  )
}

export default Register;