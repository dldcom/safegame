# 1단계: 빌드 (Node.js 환경)
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 실행 (Nginx 환경)
FROM nginx:stable-alpine
# 빌드 결과물을 Nginx의 기본 정적 파일 폴더로 복사
COPY --from=build /app/dist /usr/share/nginx/html
# 작성한 nginx.conf 설정 적용
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
