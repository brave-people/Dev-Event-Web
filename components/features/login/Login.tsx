import React, { Dispatch, SetStateAction } from "react";
import TextButton from "components/common/buttons/TextButton";
import * as ga from 'lib/utils/gTag';

type Props = {
  setLoginModalIsOpen: Dispatch<SetStateAction<boolean>>;
}

function Login({ setLoginModalIsOpen }: Props) {
  return (
    <TextButton
    label="로그인"
    size="regular"
    onClick={() => {
      setLoginModalIsOpen(true);
      ga.event({
        action: 'web_event_로그인버튼클릭',
        event_category: 'web_event',
        event_label: '로그인',
      });
    }}
    ></TextButton>
  )
}

export default Login;