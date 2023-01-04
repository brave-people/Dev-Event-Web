import axios from 'axios';
import router from 'next/router';

interface Prop {
  message: string;
  status: string;
  status_code: number;
}
async function handleError(props: Prop) {
  const result = getErrorAlert(props);
  if (result === 'AUTH_ERROR') {
    const response = await axios.post('/api/logout');
    if (response.status === 200) {
      router.push('/');
    }
  }
}

function getErrorAlert(props: Prop) {
  if (props.status_code === 400) {
    if (props.status === 'TOKEN_400_01') {
      alert('요청에서 토큰을 찾지 못해 인증에 실패했습니다. 다시 로그인 해주세요!');
      return 'AUTH_ERROR';
    }
    if (props.status === 'TOKEN_400_02') {
      alert('토큰이 만료되었습니다. 다시 로그인 해주세요!');
      return 'AUTH_ERROR';
    }
    if (props.status === 'TOKEN_400_03') {
      alert('잘못된 형식의 토큰으로 인증에 실패했습니다. 다시 로그인 해주세요!');
      return 'AUTH_ERROR';
    }
    if (props.status === 'TOKEN_400_04') {
      alert('접근 권한이 없어 인증에 실패했습니다.');
      return 'AUTH_ERROR';
    }
    if (props.status === 'AUTH_400_01') {
      alert('아이디 혹은 비밀번호가 잘못되었습니다. 다시 로그인 해주세요!');
      return 'AUTH_ERROR';
    }
    if (props.status === 'AUTH_400_04') {
      alert('이미 존재하는 이메일입니다.');
      return 'AUTH_ERROR';
    }
    if (props.status === 'AUTH_400_05') {
      alert('이미 존재하는 아이디입니다.');
      return 'AUTH_ERROR';
    }
  } else if (props.status_code === 404) {
    if (props.status === 'AUTH_404_01') {
      alert('존재하지 않은 사용자입니다. 다시 로그인 해주세요!');
      return 'AUTH_ERROR';
    }
  } else if (props.status_code === 500) {
    if (props.status === 'AUTH_500_00') {
      alert('요청과정에서 인증 오류가 발생했습니다.');
      return 'AUTH_ERROR';
    }
    if (props.status === 'AUTH_500_01') {
      alert('리프레시 토큰이 없어 자동로그인에 실패하였습니다. 다시 로그인 해주세요!');
      return 'AUTH_ERROR';
    }
    if (props.status === 'AUTH_500_02') {
      alert('자동로그인 중 서버 오류가 발생했습니다.');
      return 'AUTH_ERROR';
    }
    if (props.status === 'AUTH_500_03') {
      alert('로그인에 문제가 발생했습니다.');
      return 'AUTH_ERROR';
    }
    if (props.status === 'AUTH_500_04') {
      alert('소셜 로그인에 문제가 발생했습니다.');
      return 'AUTH_ERROR';
    }
    if (props.status === 'TOKEN_500_01') {
      alert('토큰 검증에 실패하였습니다. 다시 로그인해주세요!');
      return 'AUTH_ERROR';
    }
    if (props.status === 'ERROR_500_00') {
      alert('요청과정에서 서버 오류가 발생했습니다.');
      return 'SERVER_ERROR';
    }
  } else {
    alert('요청과정에서 문제가 발생했습니다.');
    return 'UNKNOWN_ERROR';
  }
}
export { handleError };
