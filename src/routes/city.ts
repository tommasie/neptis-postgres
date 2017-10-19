import * as express from "express";
import * as logger from "winston";

import {City} from '../models/models';

const cityRouter = express.Router();
cityRouter.use((req,res,next) => {
  next();
});

cityRouter.route('/')
  .get((req,res) => {
    City.findAll({raw: true,})
      .then((attractions) => {
        res.send(attractions);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  })
  .post((req,res) => {
    City.create(req.body)
      .then((attraction) => {
        res.status(201).json(attraction);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  });

cityRouter.route('/:id')
  .get((req,res) => {
    let id = +req.params.id;
    City.findById(id)
    .then((attraction) => {
      res.send(attraction);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
  })
  .put((req,res) => {
    City.update(req.body, {where: {id: +req.params.id}})
      .then((attraction) => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  })
  .delete((req,res) => {
    City.destroy({where: {id:+req.params.id}})
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });;
  });

export {cityRouter};
