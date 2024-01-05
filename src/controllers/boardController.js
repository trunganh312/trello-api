import { StatusCodes } from 'http-status-codes';
import { boardService } from '~/services/boardService';

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body', req.body);
    // console.log('req.query', req.query);
    // console.log('req.params', req.params);
    // console.log('req.files', req.files);
    // console.log('req.cookies', req.cookies);
    // console.log('req.jwtDecoded', req.jwtDecoded);

    // Điều hướng sang tầng service
    const createdBoard = await boardService.createNew(req.body);
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(createdBoard);
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
    const boardId = req.params.id;
    const board = await boardService.getDetails(boardId);
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(board);
  } catch (error) {
    // console.log('error', error);
    // console.log('new Error(error)', new Error(error));
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: error.message });
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    // console.log('req.params', req.params);
    const boardId = req.body._id;
    const updatedBoad = await boardService.update(boardId, req.body);
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(updatedBoad);
  } catch (error) {
    // console.log('error', error);
    // console.log('new Error(error)', new Error(error));
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: error.message });
    next(error);
  }
};

const moveCardDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardDifferentColumn(req.body);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardDifferentColumn
};
