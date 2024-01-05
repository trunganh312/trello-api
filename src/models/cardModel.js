import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards';
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
});

// Chỉ định những trường được phép update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId'];

// Validate dữ liệu vào model và xét thêm các field vào DB mà mình chưa khai báo ở file boardValidation vd: _destroy, createdAt, ...
const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const createdNew = async (data) => {
  try {
    const validCardData = await validateBeforeCreate(data);
    const newValidData = {
      ...validCardData,
      boardId: new ObjectId(data.boardId),
      columnId: new ObjectId(data.columnId)
    };
    const createdBoard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newValidData);

    return createdBoard;
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (id) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return result;
    // const result = await GET_DB()
    //   .collection(CARD_COLLECTION_NAME)
    //   .aggregate([
    //     { $match: { _id: new ObjectId(id), _destroy: false } },
    //     {
    //       $lookup: {
    //         from: columnModel.CARD_COLLECTION_NAME,
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
      .collection(CARD_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getListCard = async () => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).find().toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (cardId, updateData) => {
  try {
    Object.keys(updateData).forEach((key) => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updateData[key];
      }
    });

    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(cardId) }, { $set: updateData }, { returnDocuments: 'after' });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteManyCardByColumnId = async (columnId) => {
  try {
    const result = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({ columnId: new ObjectId(columnId) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createdNew,
  findOneById,
  getListCard,
  getDetails,
  update,
  deleteManyCardByColumnId
};
