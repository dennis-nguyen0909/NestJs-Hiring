# Sử dụng image node
FROM node:18

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json
COPY package*.json ./

# Cài đặt các dependencies, bao gồm cả bcrypt
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Biên dịch ứng dụng
RUN npm run build

# Expose cổng 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "run", "start:prod"]


# Khi bị lỗi brycpt thì rm -rf node_modules package-lock.json 
# sau đó chạy build docker là được
# docker run -e MONGODB_URI="mongodb://root:123456@mongodb:27017/hiring_db?authSource=admin" -p 8080:8080 -p 8082:8082 --network nest-hiring_app-network nest-hiring
