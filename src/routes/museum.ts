import * as express from "express";
import * as logger from "winston";
import {sequelize} from '../connection';
import * as Sequelize from 'sequelize';
import {Museum, Curator, City, Room, AttractionM} from '../models/models';
const neo4j = require('neo4j-driver').v1;

const museumRouter = express.Router();
museumRouter.use((req,res,next) => {
    let pathName = '[' + req.baseUrl + '] ';
    logger.info(pathName + req.method);
    next();
});

museumRouter.route('/')
.get((req,res) => {
    let curatorId = req.query.curator_id;
    Museum.findAll({
        where: {
          curator_id: curatorId
        }
    })
    .then((museums) => {
        res.send(museums);
    })
    .catch((err) => {
        console.log(err);
        res.send(500);
    });
})
.post((req,res) => {
    console.log(req.body);
    Museum.create(req.body/*,
        {
            include: [
                { model: Room,
                    include: [AttractionM]
                }
            ]
        }*/
    )
    .then(museum =>
    {
        const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'emaldyst'));
        const session = driver.session();
        let create = "CREATE (:Museum {id:" + museum['id'] +"})";
        session.run(create)
        .then(result => {
            res.status(201).send(museum);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });

    })/*{
        Room.findOne({
            where: {
                name: req.body.start,
                museum_id: museum['id']
            },
            raw: true
        }).then(room1 => {
            Room.findOne({
                where: {
                    name: req.body.end,
                    museum_id: museum['id']
                },
                raw: true
            }).then(room2 => {
                Museum.update({
                    room_start: room1['id'],
                    room_end: room2['id']
                }, {
                    where: {
                        id: museum['id']
                    },
                    fields: ['room_start', 'room_end']
                }).then(() => {
                    res.status(201).send(museum);
                })
            })
        })
    })*/
    .catch((err) => {
        console.log(err);
        res.send(500);
    });
});

museumRouter.route('/city')
.get((req,res) => {
    let city = req.query.city;
    let region = req.query.region;
    let query = "SELECT museum.id, museum.name FROM museum JOIN curator on museum.curator_id = curator.id " +
    "JOIN city ON curator.city_id = city.id WHERE city.name = :name AND city.region = :region";
    sequelize.query(query, { replacements: { name: city, region: region }, type: sequelize.QueryTypes.SELECT })
    .then(museums => {
        res.status(200).send(museums);
    })
    .catch(err => {
        logger.error(err);
        res.sendStatus(500);
    })
});

museumRouter.route('/attractions/:museum_id')
.get((req,res) => {
    let museumId = req.params.museum_id;
    let query = "SELECT attraction_m.id, attraction_m.name FROM attraction_m JOIN room on attraction_m.room_id = room.id " +
    "WHERE room.museum_id = :museum_id";
    sequelize.query(query, { replacements: { museum_id: museumId }, type: sequelize.QueryTypes.SELECT })
    .then(attractions => {
        res.status(200).send(attractions);
    })
    .catch(err => {
        logger.error(err);
        res.sendStatus(500);
    })
});

museumRouter.route('/:id')
.get((req,res) => {
    let id = +req.params.id;
    Museum.findById(id,{ include: [
        {
            model: Room,
            include: [AttractionM]
        }
    ]})
    .then((museum) => {
        res.send(museum);
    })
    .catch((err) => {
        console.log(err);
        res.send(500);
    });
})
.put((req,res) => {
    Museum.update(req.body, {where: {id: +req.params.id}})
    .then((museum) => {
        res.send(museum);
    })
    .catch((err) => {
        console.log(err);
        res.send(500);
    });
})
.delete((req,res) => {
    Museum.destroy({where: {id:+req.params.id}})
    .then(() => {
        res.sendStatus(200);
    })
    .catch((err) => {
        console.log(err);
        res.send(500);
    });
});


export {museumRouter};
