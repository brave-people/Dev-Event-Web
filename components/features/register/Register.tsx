import Link from "next/link";
import * as ga from 'lib/utils/gTag';
import TextButton from "components/common/buttons/TextButton";

function Register() {
  return (
    <Link href={'https://forms.gle/UUjUVg1tTrKhemKu9'}>
    <a>
      <TextButton
        label="행사등록"
        onClick={() => {
          ga.event({
            action: 'web_event_행사등록버튼클릭',
            event_category: 'web_event',
            event_label: '행사등록',
          });
        }}
      ></TextButton>
    </a>
  </Link>
  )
}

export default Register;