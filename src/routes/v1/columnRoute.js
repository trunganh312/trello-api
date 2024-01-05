import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { columnController } from '~/controllers/columnController';
import { columnValidation } from '~/validations/columnValidation';
const Router = express.Router();

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API V1 get list column' });
  })
  .post(columnValidation.createNew, columnController.createNew);

Router.route('/:id')
  .patch(columnValidation.update, columnController.update)
  .delete(columnValidation.deleteColumn, columnController.deleteColumn); // update board

export const columnRoute = Router;
