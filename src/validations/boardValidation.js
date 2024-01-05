import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import ApiError from '~/utils/ApiError';
import { BOARD_TYPES } from '~/utils/constants';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';

const createNew = async (req, res, next) => {
  /**
   * Note: Mặc định chúng ta không cần custom message ở phía BR làm gì vì để cho FE tự validate và custom message ở phía FE cho đẹp
   * Back-end: Chỉ cần validate dữ liệu chuẩn xác, và trả về message mặc định từ thư viện là được.
   * Quan trọng: Việc validate dữ liệu bắt buộc phải có ở phần BE vì đây là điểm cuối để lưu trữ dữ liệu vào CSDL
   * Và thông thường trong thực tế, điều tốt nhất cho hệ thông là hãy luôn validate dữ liệu ở cả Back-end và Front-end nhé
   */
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must be at most 50 characters long',
      'string.trim': 'Title cannot have leading or trailing spaces',
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  });
  try {
    // console.log('req.body', req.body);
    // Chỉ định abortEarly: false để validate nhiều lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    // Validate xong xuôi thì điều hướng sang controller
    next();
  } catch (error) {
    // console.log('error', error);
    // console.log('new Error(error)', new Error(error));
    const errorMessage = new Error(error).message;
    const customerError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
    next(customerError);
  }
};

const update = async (req, res, next) => {
  /**
   * Note: Mặc định chúng ta không cần custom message ở phía BR làm gì vì để cho FE tự validate và custom message ở phía FE cho đẹp
   * Back-end: Chỉ cần validate dữ liệu chuẩn xác, và trả về message mặc định từ thư viện là được.
   * Quan trọng: Việc validate dữ liệu bắt buộc phải có ở phần BE vì đây là điểm cuối để lưu trữ dữ liệu vào CSDL
   * Và thông thường trong thực tế, điều tốt nhất cho hệ thông là hãy luôn validate dữ liệu ở cả Back-end và Front-end nhé
   */
  const correctCondition = Joi.object({
    // Update không được để các trường là required
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
  });
  try {
    // console.log('req.body', req.body);
    // Chỉ định abortEarly: false để validate nhiều lỗi
    // Update những field không định nghĩa ở trên vd như columnOrderIds
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    // Validate xong xuôi thì điều hướng sang controller
    next();
  } catch (error) {
    // console.log('error', error);
    // console.log('new Error(error)', new Error(error));
    const errorMessage = new Error(error).message;
    const customerError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
    next(customerError);
  }
};

const moveCardDifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

    prevCardOrderIds: Joi.array()
      .required()
      .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)),
    nextCardOrderIds: Joi.array().required().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
  });
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customerError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
    next(customerError);
  }
};

export const boardValidation = {
  createNew,
  update,
  moveCardDifferentColumn
};
