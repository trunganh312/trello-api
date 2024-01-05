import exitHook from 'async-exit-hook';
import express from 'express';
import { CLOSE_DB, CONNECT_DB } from './config/mongodb';
import { env } from './config/environment';
import { APIs_V1 } from './routes/v1';
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware';
import cors from 'cors';
import { corsOptions } from './config/cors';
const START_SERVER = () => {
  const app = express();

  app.use(cors(corsOptions));

  const hostname = env.APP_HOST;
  const port = env.APP_PORT;

  // app.get('/', async (req, res) => {
  //   // Test Absolute import mapOrder
  //   res.end('<h1>Hello World!</h1><hr>');
  // });

  // Enable req.body json data
  app.use(express.json());

  // API v1
  app.use('/v1', APIs_V1);

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware);

  app.listen(port, hostname, () => {
    console.log(`3.Hello ${env.AUTHOR}, I am running at http://${hostname}:${port}/`);
  });

  // Thực hiện tác vụ cleanup khi dừng server
  exitHook(() => {
    console.log('4. Disconnecting from MongoDB cloud Atlas...');
    CLOSE_DB();
    console.log('5. Disconnected from MongoDB cloud Atlas...');
  });
};

//  Chỉ khi kết nối tới DB thành công thì Start Server Back-end mới lên
(async () => {
  try {
    console.log('1. Connecting to MongoDB...');
    await CONNECT_DB();
    console.log('2. Connected to MongoDB cloud Atlas');
    // Khởi động server backend sau khi connect với MongoDB
    START_SERVER();
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
})();

// // Chỉ khi kết nối tới DB thành công thì Start Server Back-end mới lên
// console.log('1. Connecting to MongoDB...');
// CONNECT_DB()
//   .then(() => console.log('2.Connected to MongoDB cloud Atlas'))
//   .then(() => START_SERVER())
//   .catch((error) => {
//     console.log(error);
//     process.exit(0);
//   });
