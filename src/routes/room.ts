import * as express from "express";
import * as logger from "winston";
import * as Sequelize from 'sequelize';
import {sequelize} from '../connection';
import {Room, Adjacency} from '../models/models';

const roomRouter = express.Router();
roomRouter.use((req,res,next) => {
  next();
});

roomRouter.route('/adjacency/:museumId')
    .get((req,res) => {
        let museumId = req.params.museumId;
        let query = "SELECT adj.minutes, adj.room1_id, adj.room2_id FROM adjacency as adj JOIN room as r1 ON adj.room1_id = r1.id JOIN room as r2 ON adj.room2_id = r2.id, museum " +
        "WHERE r1.museum_id = :museumId";
        sequelize.query(query, {replacements: {museumId: museumId}, raw: true, type: Sequelize.QueryTypes.SELECT})
        .then(response => {
            res.status(200).send(response);
        })
    })
    .post((req,res) => {
        let museumId = req.params.museumId;
        Object.keys(req.body).forEach(src => {
            Room.findOne({
                where: {
                    name: src,
                    museum_id: museumId
                },
                raw: true
            }).then(room1 => {
                req.body[src].forEach(target => {
                    Room.findOne({
                        where: {
                            name: target,
                            museum_id: museumId
                        },
                        raw: true
                    }).then(room2 => {
                        Adjacency.create({
                            room1_id: room1['id'],
                            room2_id: room2['id']
                        }).then(response => {
                            res.sendStatus(201);
                        }).catch(err => {
                            res.send(500);
                        })
                    }).catch(err => {
                        res.send(500);
                    })
                })
            }).catch(err => {
                res.send(500);
            })
        })
    });

export {roomRouter};
