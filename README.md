# Daily Alog

## Todo

- 알림
- 메일 템플릿
- 답변, 댓글 삭제?

# Docker

- 이미지 생성
  `docker build -t fromecha/daily_algo:0.0.9 .`

- 도커허브 Push
  `docker push fromecha/daily_algo:0.0.9`

- 도커허브 Pull
  `docker pull fromecha/daily_algo:0.0.9`

- 컨테이너 실행
  `docker run -itd -p 8080:8080 --name da dvlprjw/daily_algo:0.0.9`

- 도커 컨테이너 종료
  `docker stop da`
  `docker rm da`

- 도커 이미지 삭제
  `docker rmi dvlprjw/daily_algo:0.0.9`

- 기타
  - 이미지 확인 : `docker images`
  - 컨테이너 확인 : `docker ps -a`
