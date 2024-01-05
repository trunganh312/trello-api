import { StatusCodes } from 'http-status-codes';
import { columnService } from '~/services/columnService';

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body', req.body);
    // console.log('req.query', req.query);
    // console.log('req.params', req.params);
    // console.log('req.files', req.files);
    // console.log('req.cookies', req.cookies);
    // console.log('req.jwtDecoded', req.jwtDecoded);

    // Điều hướng sang tầng service
    const createdColumn = await columnService.createNew(req.body);
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(createdColumn);
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
    const columnId = req.params.id;
    const column = await columnService.getDetails(columnId);
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(column);
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
    const columnId = req.params.id;
    const updateColumn = await columnService.update(columnId, req.body);
    // Có kết quả thì trả về phía client
    res.status(StatusCodes.OK).json(updateColumn);
  } catch (error) {
    // console.log('error', error);
    // console.log('new Error(error)', new Error(error));
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ errors: error.message });
    next(error);
  }
};

const deleteColumn = async (req, res, next) => {
  try {
    const columnId = req.params.id;
    const deleteColumn = await columnService.deleteColumn(columnId);
    res.status(StatusCodes.OK).json(deleteColumn);
  } catch (error) {
    next(error);
  }
};

export const columnController = {
  createNew,
  getDetails,
  update,
  deleteColumn
};
