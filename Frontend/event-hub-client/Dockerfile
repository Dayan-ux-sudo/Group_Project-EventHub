FROM node:20-alpine AS builder

WORKDIR /app

COPY Frontend/event-hub-client/package*.json /app/
RUN npm install

COPY Frontend/event-hub-client /app

ARG VITE_API_BASE_URL=http://localhost:8000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY Frontend/event-hub-client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

