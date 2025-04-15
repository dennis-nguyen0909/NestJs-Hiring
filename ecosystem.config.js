module.exports = {
  apps: [
    {
      name: 'nest-hire-dev', // Tên ứng dụng của bạn, thay đổi nếu cần
      script: 'dist/main.js', // Đường dẫn đến file entry point đã biên dịch của NestJS
      instances: '3', // Số lượng instance bạn muốn chạy, có thể là "max"
      autorestart: true, // Tự động khởi động lại nếu ứng dụng bị crash
      watch: false, // Không theo dõi thay đổi file trong production, đặt thành true nếu cần cho dev
      max_memory_restart: '1G', // Khởi động lại nếu sử dụng quá 1GB RAM
    },
  ],
};
