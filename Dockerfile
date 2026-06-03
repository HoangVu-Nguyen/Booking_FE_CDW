# Stage 1: Build source code Angular bằng Node 22
FROM node:22-alpine AS build-step
WORKDIR /app
COPY package*.json ./

# CHỈ GIỮ LẠI DUY NHẤT DÒNG NÀY ĐỂ BỎ QUA XUNG ĐỘT
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Cấu hình chạy Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-step /app/dist/clyvasync-booking /usr/share/nginx/html
EXPOSE 80