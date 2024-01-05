import { StatusCodes } from 'http-status-codes';
import { cloneDeep } from 'lodash';
import { boardModel } from '~/models/boardModel';
import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';
import ApiError from '~/utils/ApiError';

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newColumn = {
      ...reqBody
    };
    // Gọi tới tầng Model để xử lý lưu bản ghi newColumn vào trong DB
    const createdNewColumn = await columnModel.createdNew(newColumn);
    // Lấy ra column vừa gửi vào db
    const getNewColumn = await columnModel.findOneById(createdNewColumn.insertedId);
    // Lấy ra danh sách các column sau mỗi lần thêm newColumn vào trong DB
    // const getListColumn = await columnModel.getListColumn();

    // Thêm columnOrderIds vào bảng Board, và thêm mảng card vào bảng column
    if (getNewColumn) {
      getNewColumn.cards = [];

      await boardModel.pushColumnOrderIds(getNewColumn);
    }

    // Làm thêm các xử lý logic khác với Collection tùy đặc thù dự án...
    // Bắn email, notification về cho admin khi có 1 cái column mới được tạo,...

    // Trong service luôn luôn phải return ra 1 kết quả
    return getNewColumn;
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (boarId) => {
  try {
    const column = await columnModel.getDetails(boarId);
    if (!column) throw new ApiError(StatusCodes.NOT_FOUND, 'column not found');

    const resColumn = cloneDeep(column);

    return resColumn;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (columnId, reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      updatedAt: Date.now()
    };
    const result = await columnModel.update(columnId, newBoard);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteColumn = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId);

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found');
    }

    // Xóa column theo columnId trong bảng columns
    const result = await columnModel.deleteColumn(columnId);

    // Xóa các card có columnId là columnId trong bảng cards
    const resultCardDeleted = await cardModel.deleteManyCardByColumnId(columnId);

    // Chỉnh sửa lại trường columnOrderIds trong bảng Boards khi column được xóa
    await boardModel.pullColumnOrderIds(targetColumn);
    return { actionResult: 'Successfully deleted', result, resultCardDeleted };
  } catch (error) {
    throw new Error(error);
  }
};

export const columnService = {
  createNew,
  getDetails,
  update,
  deleteColumn
};
