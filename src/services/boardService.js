import { StatusCodes } from 'http-status-codes';
import { cloneDeep } from 'lodash';
import { ObjectId } from 'mongodb';
import { boardModel } from '~/models/boardModel';
import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';
import ApiError from '~/utils/ApiError';
import { slugify } from '~/utils/formatters';

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    };

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong DB
    const createdNewBoard = await boardModel.createdNew(newBoard);
    // Lấy ra board vừa gửi vào db
    const getNewBoard = await boardModel.findOneById(createdNewBoard.insertedId);
    // Lấy ra danh sách các board sau mỗi lần thêm newBoard vào trong DB
    const getListBoard = await boardModel.getListBoard();

    // Làm thêm các xử lý logic khác với Collection tùy đặc thù dự án...
    // Bắn email, notification về cho admin khi có 1 cái board mới được tạo,...

    // Trong service luôn luôn phải return ra 1 kết quả
    return getNewBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (boarId) => {
  try {
    const board = await boardModel.getDetails(boarId);
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');

    const resBoard = cloneDeep(board);
    resBoard.columns.forEach((column) => {
      // C1: Vì kiểu id trả vể là ObjectId của mongoDB nên so sánh ba dấu bằng sẽ không bằng nên t phải chuyển chúng về cùng kiểu toString để so sánh
      // column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString());

      // C2: Bởi vì mongoDB hỗ trợ kiểu so sánh bằng equals nên t không cần chuyển sang kiểu toString
      column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id));
    });

    // Sau khi t thêm cards vào columns thì t xóa cards trong board đi
    delete resBoard.cards;

    return resBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (boarId, reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      updatedAt: Date.now()
    };
    const result = await boardModel.update(boarId, newBoard);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const moveCardDifferentColumn = async (reqBody) => {
  try {
    //B1: Cập nhật mảng cardOrderIds ở bảng column ban đầu chứa nó
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    });
    //B2: Cập nhật mảng cardOrderIds ở bảng column tiếp theo chứa nó
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    });
    //B3: Cập nhật lại trường columnId ở card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: new ObjectId(reqBody.nextColumnId),
      updatedAt: Date.now()
    });
    return { updateResult: 'Successfully!!' };
  } catch (error) {
    throw new Error(error);
  }
};

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardDifferentColumn
};
