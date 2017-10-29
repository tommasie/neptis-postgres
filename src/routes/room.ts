import * as express from "express";
import * as logger from "winston";
import * as Sequelize from 'sequelize';
import * as async from 'async';
const neo4j = require('neo4j-driver').v1;
import {sequelize} from '../connection';
import {Room} from '../models/models';

const roomRouter = express.Router();
roomRouter.use((req,res,next) => {
    next();
});

roomRouter.route('/adjacencies')
.get((req,res) => {
    const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'emaldyst'));
    const session = driver.session();
    let museumId = req.query.museum;
    let adjList = {};
    let response = {
        adjacencies: {},
        start: 0,
        end: 0
    };
    session.run("MATCH (a)-[:NEXT]->(b) WHERE a.museum =" + museumId +" RETURN a,b")
    .then(links => {
        links.records.forEach(record => {
            let id1 = record.get('a').properties.id.toNumber();
            let id2 = record.get('b').properties.id.toNumber();
            if(adjList[id1] == undefined) {
                adjList[id1] = [];
            }
            adjList[id1].push(id2);
            if(adjList[id2] == undefined)
            adjList[id2] = [];
            response.adjacencies = adjList;
            session.run("MATCH (n)-[:START]->(a), (n)<-[:END]-(b) WHERE n.id =" + museumId +" RETURN a,b")
            .then(dummies => {
                response.start = dummies.records[0].get('a').properties.id.toNumber();
                response.end = dummies.records[0].get('b').properties.id.toNumber();
                res.send(response);
            }).catch(err => {
                throw err;
            });
        });
    }).catch(err => {

    });

})
.post((req,res) => {
    const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'emaldyst'));
    const session = driver.session();
    let museumId = neo4j.int(req.body.museum_id);
    let name2id = {};
    let adjList = {};
    let adjacencies = req.body.adjacencies;
    let start = req.body.start;
    let end = req.body.end;

    Room.findAll({
        where: {
            museum_id: req.body.museum_id
        },
        raw:true,
    }).then(rooms => {
        rooms.forEach(room => {
            name2id[room['name']] = neo4j.int(room['id']);
            adjList[room['id']] = [];
        });
        start = name2id[start];
        end = name2id[end];

        Object.keys(adjacencies).forEach(key => {
            let keyId = name2id[key];
            adjList[keyId] = adjacencies[key].map(name => name2id[name]);
        });
        let create = "CREATE ";
        rooms.forEach(room => {
            create += "(:Room {id:" + neo4j.int(room['id']) + ", museum:" + museumId + "}), ";
        });
        create += "(:Museum {id:" + museumId +"})";
        session.run(create)
        .then(result => {
            let rels = [];
            Object.keys(adjList).forEach(s => {
                adjList[s].forEach(t => {
                    let rel = "MATCH (a:Room), (b:Room) WHERE a.id =" + s + " AND b.id =" + t + " CREATE (a)-[:NEXT]->(b)";
                    rels.push(rel);
                });
            });
            async.each(rels, (rel, cb) => {
                session.run(rel)
                .then(result => {
                    cb();
                }).catch(err => {
                    cb(err);
                });
            }, err => {
                if(err) throw err;
                let q = "MATCH (a:Museum), (b:Room) WHERE a.id ="+museumId+" AND b.id ="+start+" CREATE (a)-[:START]->(b)";
                session.run(q)
                .then(result => {
                    let q = "MATCH (a:Museum), (b:Room) WHERE a.id ="+museumId+" AND b.id ="+end+" CREATE (a)<-[:END]-(b)";
                    session.run(q)
                    .then(result => {
                        session.close();
                        driver.close();
                        res.sendStatus(201);
                    }).catch(err => {
                        logger.error(err);
                        session.close();
                        driver.close();
                        res.sendStatus(500);
                    });
                }).catch(err => {
                    logger.error(err);
                    session.close();
                    driver.close();
                    res.sendStatus(500);
                });
            })

        }).catch(err => {
            logger.error(err);
            session.close();
            driver.close();
            res.sendStatus(500);
        });
    }).catch(err => {
        logger.error(err);
        res.sendStatus(500);
    });
});
export {roomRouter};
