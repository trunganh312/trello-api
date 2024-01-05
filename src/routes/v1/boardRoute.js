import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardController } from '~/controllers/boardController';
import { boardValidation } from '~/validations/boardValidation';
const Router = express.Router();

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'API V1 get list boards' });
  })
  .post(boardValidation.createNew, boardController.createNew);

Router.route('/:id').get(boardController.getDetails).patch(boardValidation.update, boardController.update); // update
Router.route('/support/move_card_different_column').patch(
  boardValidation.moveCardDifferentColumn,
  boardController.moveCardDifferentColumn
);

export const boardRoute = Router;
