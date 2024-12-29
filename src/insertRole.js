const { MongoClient } = require('mongodb');

// URL kết nối MongoDB (chỉnh sửa nếu cần thiết)
// const url = 'mongodb://root:123456@localhost:27017';
const url = 'mongodb://10.108.144.9:27017';
const dbName = 'hiring_db'; // Thay 'your_database_name' bằng tên database của bạn

// Kết nối tới MongoDB và chèn dữ liệu vào collection 'role'
async function insertRoles() {
  const client = new MongoClient(url, { useUnifiedTopology: true });

  try {
    // Kết nối tới server MongoDB
    await client.connect();
    console.log('Kết nối thành công tới MongoDB');

    // Chọn database và collection
    const db = client.db(dbName);
    const roleCollection = db.collection('roles');
    const authProviderCollection = db.collection('authproviders');

    // Các role sẽ được chèn vào collection
    const roles = [
      { role_name: 'USER' },
      { role_name: 'EMPLOYER' },
      { role_name: 'CANDIDATE' },
    ];
    const auth = [
      {
        provider_name: 'GOOGLE',
        provider_id: 'google',
      },
      {
        provider_name: 'FACEBOOK',
        provider_id: 'facebook',
      },
      {
        provider_name: 'GITHUB',
        provider_id: 'github',
      },
      {
        provider_name: 'LOCAL',
        provider_id: 'local',
      },
    ];

    // Chèn các role vào collection
    const result = await roleCollection.insertMany(roles);
    const result2 = await authProviderCollection.insertMany(auth);
    // Kiểm tra kết quả
    console.log(`${result.insertedCount} vai trò đã được chèn thành công`);
    console.log(`${result2.insertedCount} auth đã được chèn thành công`);
  } catch (err) {
    console.error('Lỗi khi chèn dữ liệu:', err);
  } finally {
    // Đóng kết nối tới MongoDB
    await client.close();
  }
}

// Gọi hàm insertRoles để chèn dữ liệu
insertRoles();
