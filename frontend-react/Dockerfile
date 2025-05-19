FROM node:18

WORKDIR /app
COPY . .
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
