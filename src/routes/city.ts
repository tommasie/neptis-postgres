import * as express from 'express';
import { logger } from '../config/logger';

import { City } from '../facade/models';

const cityRouter = express.Router();
cityRouter.use((req, res, next) => {
  next();
});

cityRouter.route('/')
  .get((req, res) => {
    City.findAll({ raw: true })
      .then((attractions) => {
        res.send(attractions);
      })
      .catch((err) => {
        logger.error(err);
        res.sendStatus(500);
      });
  })
  .post((req, res) => {
    City.create(req.body)
      .then((attraction) => {
        res.status(201).json(attraction);
      })
      .catch((err) => {
        logger.error(err);
        res.sendStatus(500);
      });
  });

cityRouter.route('/:id')
  .get((req, res) => {
    const id = +req.params.id;
    City.findById(id)
      .then((attraction) => {
        res.send(attraction);
      })
      .catch((err) => {
        logger.error(err);
        res.sendStatus(500);
      });
  })
  .put((req, res) => {
    City.update(req.body, { where: { id: +req.params.id } })
      .then((attraction) => {
        res.sendStatus(204);
      })
      .catch((err) => {
        logger.error(err);
        res.sendStatus(500);
      });
  })
  .delete((req, res) => {
    City.destroy({ where: { id: +req.params.id } })
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        logger.error(err);
        res.sendStatus(500);
      });
  });

export { cityRouter };
