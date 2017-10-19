import * as express from "express";
import * as logger from "winston";
import {sequelize} from '../connection';
import {AttractionM} from '../models/models';

const attractionMRouter = express.Router();
attractionMRouter.use((req,res,next) => {
  let pathName = '[' + req.baseUrl + '] ';
  logger.info(pathName + req.method);
  next();
});
attractionMRouter.route('/')
  .get((req,res) => {
    AttractionM.findAll()
      .then((attractions) => {
        res.send(attractions);
      })
      .catch((err) => {
        console.log(err);
        res.send(500);
      });
  })
  .post((req,res) => {
    console.log(req.body);
    AttractionM.create(req.body)
      .then((attraction) => {
        res.send(attraction);
      })
      .catch((err) => {
        console.log(err);
        res.send(500);
      });
  });

attractionMRouter.route('/museum')
  .get((req,res) => {
    let museumId = req.query.id;
    let query = "SELECT attraction_m.id, attraction_m.name FROM attraction_m JOIN room on attraction_m.room_id = room.id " +
      "WHERE room.museum_id = :id";
    sequelize.query(query, { replacements: { id: museumId }, type: sequelize.QueryTypes.SELECT })
      .then(attractions => {
        res.status(200).send(attractions);
      })
      .catch(err => {
        res.sendStatus(500);
      })
  });

attractionMRouter.route('/:id')
  .get((req,res) => {
    let id = +req.params.id;
    AttractionM.findById(id)
    .then((attraction) => {
      res.send(attraction);
    })
    .catch((err) => {
      console.log(err);
      res.send(500);
    });
  })
  .put((req,res) => {
    AttractionM.update(req.body, {where: {id: +req.params.id}})
      .then((attraction) => {
        res.send(attraction);
      })
      .catch((err) => {
        console.log(err);
        res.send(500);
      });
  })
  .delete((req,res) => {
    AttractionM.destroy({where: {id:+req.params.id}})
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(err);
        res.send(500);
      });;
  });

export {attractionMRouter};
