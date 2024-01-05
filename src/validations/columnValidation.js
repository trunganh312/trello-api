import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import ApiError from '~/utils/ApiError';
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
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
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
    /**
     * // Trường hợp muốn chuyển từ column này sang board khác thì dùng tùy vào dự án
     * boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
     * */
    title: Joi.string().min(3).max(50).trim().strict()
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

const deleteColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  });
  try {
    await correctCondition.validateAsync(req.params, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customerError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage);
    next(customerError);
  }
};

export const columnValidation = {
  createNew,
  update,
  deleteColumn
};
