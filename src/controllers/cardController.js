import { StatusCodes } from 'http-status-codes';
import { cardService } from '~/services/cardService';

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body', req.body);
    // console.log('req.query', req.query);
    // console.log('req.params', req.params);
    // console.log('req.files', req.files);
    // console.log('req.cookies', req.cookies);
    // console.log('req.jwtDecoded', req.jwtDecoded);

    // Điều hướng sang tầng service
    const createdCard = await cardService.createNew(req.body);
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(createdCard);
  } catch (error) {
    // console.log('error', error);
    // console.log('new Error(error)', new Error(error));
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: error.message });
    next(error);
  }
};

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params', req.params);
    const cardId = req.params.id;
    const card = await cardService.getDetails(cardId);
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(card);
  } catch (error) {
    // console.log('error', error);
    // console.log('new Error(error)', new Error(error));
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: error.message });
    next(error);
  }
};

export const cardController = {
  createNew,
  getDetails
};
