import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { BOARD_TYPES } from '~/utils/constants';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { columnModel } from './columnModel';
import { cardModel } from './cardModel';

const BOARD_COLLECTION_NAME = 'boards';
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

// Chỉ định những trường được phép update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt'];

// Validate dữ liệu vào model và xét thêm các field vào DB mà mình chưa khai báo ở file boardValidation vd: _destroy, createdAt, ...
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createdNew = async (data) => {
  try {
    const validBoarData = await validateBeforeCreate(data);
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validBoarData);
    return createdBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (id) => {
  try {
    // const result = await GET_DB()
    //   .collection(BOARD_COLLECTION_NAME)
    //   .findOne({ _id: new ObjectId(id) });
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        { $match: { _id: new ObjectId(id), _destroy: false } },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'columns'
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        }
      ])
      .toArray();
    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getListBoard = async () => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).find().toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const pushColumnOrderIds = async (column) => {
  try {
    // C1
    // const result = await GET_DB()
    //   .collection(BOARD_COLLECTION_NAME)
    //   .updateOne({ _id: new ObjectId(column.boardId) }, { $push: { columnOrderIds: column._id } });

    // C2
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocuments: 'after' }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Dùng toán tử $pull trong mongoDB để lấy 1 phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.boardId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocuments: 'after' }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (boardId, updateData) => {
  try {
    Object.keys(updateData).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updateData[key];
      }
    });

    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map((id) => new ObjectId(id));
    }
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(boardId) }, { $set: updateData }, { returnDocuments: 'after' });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createdNew,
  findOneById,
  getListBoard,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds
};
