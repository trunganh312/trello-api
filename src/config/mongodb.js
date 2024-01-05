// const MONGODB_URI =
//   'mongodb+srv://trunganh312:Anhtrung123@cluster0-trunn.0pys6ff.mongodb.net/?retryWrites=true&w=majority';
// const DATABASE_NAME = 'trello-trunn-mernstack';

import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from './environment';

// Khởi tạo một đối tượng trelloDatabaseInstance ban đầu là null (vì chúng ta chưa connect)
let trelloDatabaseInstance = null;

// Khởi tạo đối tượng mongoClientInstance để connect tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // Lưu ý: cái serverApi có từ phiên bản MongoDB 5.0.0 trở lên, có thể không cần dùng nó, còn nêếu dùng nó là chúng ta sẽ chỉ định một cái Stable API Version của MongoDB
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

// Kết nối database
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của mongoClientInstance
  await mongoClientInstance.connect();

  // Kết nối thành công thì lấy ra db theo tên và gán ngược lại vào biến trelloDatabaseInstance ở trên của chúng ta
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME);
};

// Function GET_DB(không async) có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thành công tới MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code.
// Lưu ý phải đảm bảo chỉ luôn gọi cái GET_DB này sau khi connect thành công tới MongoDB
export const GET_DB = () => {
  if (!trelloDatabaseInstance) {
    throw new Error('Must connect to Database first');
  }
  return trelloDatabaseInstance;
};

// Đóng kết nối
export const CLOSE_DB = async () => {
  console.log('Code chạy vào đây');
  await mongoClientInstance.close();
};
