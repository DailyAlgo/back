echo 컨테이너 종료
docker stop dailyalgo_back
echo 컨테이너 삭제
docker rm dailyalgo_back
echo 이미지 삭제
docker rmi dvlprjw/dailyalgo_be
echo 깃 체크아웃 : 권한 해제
git checkout .
echo 깃 풀
sudo git pull origin main
echo redis dump 파일 권한 부여 : 권한 설정
sudo chmod 777 ./redis/data/dump.rdb
echo 도커 이미지 빌드
sudo docker build -t dvlprjw/dailyalgo_be .
echo 도커 컴포즈 실행
docker-compose up -d --force-recreate
echo 도커 컴포즈 로그 출력
docker-compose logs