import { StatusCodes } from 'http-status-codes';
import { cloneDeep } from 'lodash';
import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';
import ApiError from '~/utils/ApiError';

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newCard = {
      ...reqBody
    };
    // Gọi tới tầng Model để xử lý lưu bản ghi newCard vào trong DB
    const createdNewCard = await cardModel.createdNew(newCard);
    // Lấy ra card vừa gửi vào db
    const getNewCard = await cardModel.findOneById(createdNewCard.insertedId);
    // Lấy ra danh sách các card sau mỗi lần thêm newCard vào trong DB
    const getListCard = await cardModel.getListCard();

    // Thêm card vào trong cardsOrderIds ở bảng column
    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard);
    }

    // Làm thêm các xử lý logic khác với Collection tùy đặc thù dự án...
    // Bắn email, notification về cho admin khi có 1 cái card mới được tạo,...

    // Trong service luôn luôn phải return ra 1 kết quả
    return getNewCard;
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (boarId) => {
  try {
    const card = await cardModel.getDetails(boarId);
    if (!card) throw new ApiError(StatusCodes.NOT_FOUND, 'card not found');

    const resCard = cloneDeep(card);

    return resCard;
  } catch (error) {
    throw new Error(error);
  }
};

export const cardService = {
  createNew,
  getDetails
};
