# 1. 사용할 Node.js 버전 이미지 선택
FROM node:20

# 2. 박스 안에서 작업할 폴더 설정
WORKDIR /usr/src/app

# 3. 라이브러리 목록 파일을 먼저 복사 (캐시 효율을 위해)
COPY package*.json ./

# 4. 라이브러리 설치
RUN npm install

# 5. 서버의 모든 소스 코드를 박스 안으로 복사
COPY . .

# 6. 서버가 사용할 포트 번호 예고
EXPOSE 3001

# 7. 박스가 켜지면 서버 실행!
CMD ["node", "server.js"]
