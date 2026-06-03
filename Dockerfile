FROM node:22-alpine AS build-step
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-step /app/dist/Clyvasync_Booking/browser /usr/share/nginx/html
EXPOSE 80