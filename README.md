# Dev Event Web
> 🎉🎈 개발자 {웨비나, 컨퍼런스, 해커톤} 행사를 웹으로 알려드립니다.<br />

👉 <strong>웹 바로가기</strong> : [https://dev-event.vercel.app/events](https://dev-event.vercel.app/events)

<br />

## 개발 환경
- node 20.15.1
- npm 6.14.15
- react 17.0.2
- next 12.1.2

<br />

## 사용 방법
### 코드 포맷팅
```sh
command + alt + shift + p
```

### 라이브러리 설치
```sh
$ pnpm install
```

### developer 환경으로 실행
```sh
$ pnpm run dev
```

## 배포 
```sh
# 로컬 빌드 테스트 
$ pnpm run build 

# 배포
$ vercel build && vercel deploy

# prod 배포 
$ vercel build && vercel deploy --prod
```

