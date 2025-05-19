# ----- 第一步：用 node 建置 React 前端 -----
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
# 將環境變數寫入（例如 REACT_APP_API_URL）
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# ----- 第二步：用 nginx 服務靜態檔案並 proxy API -----
FROM nginx:alpine

# 複製 React build 結果
COPY --from=builder /app/build /usr/share/nginx/html

# 複製我們自己定義的 nginx 設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
