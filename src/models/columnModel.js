import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = 'columns';
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

// Chỉ định những trường được phép update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId'];

// Validate dữ liệu vào model và xét thêm các field vào DB mà mình chưa khai báo ở file boardValidation vd: _destroy, createdAt, ...
const validateBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createdNew = async (data) => {
  try {
    const validColumnData = await validateBeforeCreate(data);
    const newValidData = {
      ...validColumnData,
      boardId: new ObjectId(data.boardId)
    };
    const createdBoard = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newValidData);
    return createdBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (id) => {
  try {
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return result;
    // const result = await GET_DB()
    //   .collection(COLUMN_COLLECTION_NAME)
    //   .aggregate([
    //     { $match: { _id: new ObjectId(id), _destroy: false } },
    //     {
    //       $lookup: {
    //         from: columnModel.COLUMN_COLLECTION_NAME,
    //         localField: '_id',
    //         foreignField: 'boardId',
    //         as: 'columns'
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: cardModel.CARD_COLLECTION_NAME,
    //         localField: '_id',
    //         foreignField: 'boardId',
    //         as: 'cards'
    //       }
    //     }
    //   ])
    //   .toArray();
    // console.log(result);
    // return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getListColumn = async () => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).find().toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const pushCardOrderIds = async (card) => {
  try {
    // C1
    // const result = await GET_DB()
    //   .collection(COLUMN_COLLECTION_NAME)
    //   .updateOne({ _id: new ObjectId(card.columnId) }, { $push: { cardOrderIds: card._id } });

    // C2
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(card.columnId) },
        { $push: { cardOrderIds: new ObjectId(card._id) } },
        { returnDocuments: 'after' }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (columnId, columnData) => {
  try {
    Object.keys(columnData).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete columnData[key];
      }
    });

    if (columnData.cardOrderIds) {
      columnData.cardOrderIds = columnData.cardOrderIds.map((id) => new ObjectId(id));
    }

    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(columnId) }, { $set: columnData }, { returnDocuments: 'after' });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteColumn = async (columnId) => {
  try {
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(columnId) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createdNew,
  findOneById,
  getListColumn,
  getDetails,
  pushCardOrderIds,
  update,
  deleteColumn
};
