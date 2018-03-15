import * as async from 'async';
import * as express from 'express';
import * as Sequelize from 'sequelize';
import { logger } from '../config/logger';
const neo4j = require('neo4j-driver').v1;
import { neo4jDriver, sequelize } from '../connection';
import { Room } from '../facade/models';

const roomRouter = express.Router();
/*roomRouter.use((req,res,next) => {
    next();
});*/

roomRouter.route('/adjacency')
    .post((req, res) => {
        const session = neo4jDriver.session();
        const s = neo4j.int(req.body.source);
        const d = neo4j.int(req.body.destination);
        const museum = neo4j.int(req.body.museum_id);
        const rel = 'MATCH (a:Room), (b:Room) WHERE a.id =' + s + ' AND a.museum =' + museum +
            ' AND b.id =' + d + ' AND b.museum =' + museum + ' CREATE (a)-[:NEXT]->(b)';
        session.run(rel)
            .then(result => {
                session.close();
                res.sendStatus(201);
            })
            .catch(err => {
                logger.error(err);
                session.close();
                res.sendStatus(500);
            });
    });

roomRouter.delete('/adjacency/:from/:to', (req, res) => {
    const session = neo4jDriver.session();
    const s = neo4j.int(req.params.from);
    const d = neo4j.int(req.params.to);
    const rel = 'MATCH (a:Room)-[r:NEXT]->(b:Room) WHERE a.id =' + s +
        ' AND b.id =' + d + ' DETACH DELETE r';
    session.run(rel)
        .then(result => {
            session.close();
            res.sendStatus(200);
        })
        .catch(err => {
            logger.error(err);
            session.close();
            res.sendStatus(500);
        });
});

roomRouter.route('/:museum_id')
        .get((req, res) => {
            const museum = req.query.museum_id;
            Room.findAll({
                where: {
                    museum_id: museum,
                },
            })
                .then(rooms => {
                    res.send(rooms);
                });
        })
        .post((req, res) => {
            logger.info(req.body);
            const session = neo4jDriver.session();
            const museumId = neo4j.int(req.body.museum_id);
            Room.create(req.body).then((room: IRoom) => {
                const create = 'CREATE (:Room {id:' + neo4j.int(room.id) + ', museum:' + museumId + '})';
                session.run(create)
                    .then((result) => {
                        if (room.starting) {
                            const q = 'MATCH (a:Museum), (b:Room) WHERE a.id =' + museumId + ' AND b.id =' + neo4j.int(room.id) + ' CREATE (a)-[:START]->(b)';
                            session.run(q).then((r) => {
                                session.close();
                                res.status(201).send(room);
                            }).catch((err) => {
                                logger.error(err);
                                res.sendStatus(500);
                            });
                        } else {
                            session.close();
                            res.status(201).send(room);
                        }

                    })
                    .catch((err) => {
                        logger.error(err);
                        session.close();
                        res.sendStatus(500);
                    });

            });
        });

interface IRoom {
        id: number;
        name: string;
        starting: boolean;
    }
export { roomRouter };
