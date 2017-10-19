import * as express from "express";
import * as logger from "winston";
import {sequelize} from '../connection';
import * as Sequelize from 'sequelize';
import {AttractionC, Curator, City} from '../models/models';

const attractionCRouter = express.Router();
attractionCRouter.use((req,res,next) => {
  next();
});
attractionCRouter.route('/')
  .get((req,res) => {
    let curatorId = req.query.curator_id;
    AttractionC.findAll({
      where: {
        curator_id: curatorId
      }
    })
      .then(attractions => {
        res.send(attractions);
      })
      .catch((err) => {
        console.log(err);
        res.send(500);
      });
  })
  .post((req,res) => {
    console.log(req.body);
    AttractionC.create(req.body)
      .then((attraction) => {
        res.status(201).send(attraction);
      })
      .catch((err) => {
        console.log(err);
        res.send(500);
      });
  });

  attractionCRouter.route('/planning')
    .get((req,res) => {
      let city = req.query.name;
      let region = req.query.region;
      let query = "SELECT attraction_c.*, city.id as city_id FROM attraction_c JOIN curator on attraction_c.curator_id = curator.id " +
        "JOIN city ON curator.city_id = city.id WHERE city.name = :name AND city.region = :region";
      sequelize.query(query, {raw: true, replacements: { name: city, region: region }, type: sequelize.QueryTypes.SELECT })
        .then(attractions => {
            logger.info(attractions);
          res.status(200).send(attractions);
        })
        .catch(err => {
          logger.error(err);
          res.sendStatus(500);
      })
    });

attractionCRouter.route('/city')
  .get((req,res) => {
    let city = req.query.name;
    let region = req.query.region;
    let query = "SELECT attraction_c.id, attraction_c.name FROM attraction_c JOIN curator on attraction_c.curator_id = curator.id " +
      "JOIN city ON curator.city_id = city.id WHERE city.name = :name AND city.region = :region";
    sequelize.query(query, { replacements: { name: city, region: region }, type: sequelize.QueryTypes.SELECT })
      .then(attractions => {
        res.status(200).send(attractions);
      })
      .catch(err => {
        logger.error(err);
        res.sendStatus(500);
      })
  });

attractionCRouter.route('/:id')
  .get((req,res) => {
    let id = +req.params.id;
    AttractionC.findById(id)
    .then(attraction => {
      console.log(attraction);
      res.send(attraction);
    })
    .catch((err) => {
      console.log(err);
      res.send(500);
    });
  })
  .put((req,res) => {
    AttractionC.update(req.body, {where: {id: +req.params.id}})
      .then((attraction) => {
        res.status(204).send(attraction);
      })
      .catch((err) => {
        console.log(err);
        res.send(500);
      });
  })
  .delete((req,res) => {
    AttractionC.destroy({where: {id:+req.params.id}})
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log(err);
        res.send(500);
      });;
  });

export {attractionCRouter};
