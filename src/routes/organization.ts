import * as express from "express";
import * as logger from "winston";

import {Organization} from '../models/models';

const organizationRouter = express.Router();
organizationRouter.use((req,res,next) => {
  next();
});

organizationRouter.route('/')
  .get((req,res) => {
    Organization.findAll({raw: true,})
      .then((attractions) => {
        res.send(attractions);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  })
  .post((req,res) => {
    Organization.create(req.body)
      .then((attraction) => {
        res.status(201).json(attraction);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  });

organizationRouter.route('/:id')
  .get((req,res) => {
    let id = +req.params.id;
    Organization.findById(id)
    .then((attraction) => {
      res.send(attraction);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
  })
  .put((req,res) => {
    Organization.update(req.body, {where: {id: +req.params.id}})
      .then((attraction) => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  })
  .delete((req,res) => {
    Organization.destroy({where: {id:+req.params.id}})
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });;
  });

export {organizationRouter};
