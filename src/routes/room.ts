import * as express from "express";
import * as logger from "winston";
import * as Sequelize from 'sequelize';
import * as async from 'async';
const neo4j = require('neo4j-driver').v1;
import {sequelize} from '../connection';
import {Room} from '../models/models';

const roomRouter = express.Router();
/*roomRouter.use((req,res,next) => {
    next();
});*/

roomRouter.post('/adjacency',(req,res) => {
    const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'emaldyst'));
    const session = driver.session();
    let s = neo4j.int(req.body.source);
    let d = neo4j.int(req.body.destination);
    let museum = neo4j.int(req.body.museum_id);
    let rel = "MATCH (a:Room), (b:Room) WHERE a.id =" + s + " AND a.museum =" + museum +
                    " AND b.id =" + d + " AND b.museum =" + museum + " CREATE (a)-[:NEXT]->(b)";
    session.run(rel)
    .then(result => {
        session.close();
        driver.close();
        res.sendStatus(201);
    })
    .catch(err => {
        console.log(err);
        session.close();
        driver.close();
        res.sendStatus(500);
    })
});

roomRouter.route('/:museum_id')
.get((req,res) => {
    let museum = req.query.museum_id;
    Room.findAll({
        where: {
            museum_id: museum
        }
    })
    .then(rooms => {
        res.send(rooms);
    });
})
.post((req,res) => {
    console.log(req.body);
    const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'emaldyst'));
    const session = driver.session();
    let museumId = neo4j.int(req.body.museum_id);
    Room.create(req.body).then(room => {
        let create = "CREATE (:Room {id:" + neo4j.int(room['id']) + ", museum:" + museumId + "})";
        session.run(create)
        .then(result => {
            if(room['starting']) {
                let q = "MATCH (a:Museum), (b:Room) WHERE a.id ="+museumId+" AND b.id ="+neo4j.int(room['id'])+" CREATE (a)-[:START]->(b)";
                session.run(q).then(r => {
                    session.close();
                    driver.close();
                    res.status(201).send(room);
                }).catch(err => {
                    console.log(err);
                    res.sendStatus(500);
                })
            }
            else {
            session.close();
            driver.close();
            res.status(201).send(room);
        }

        })
        .catch(err => {
            console.log(err);
            session.close();
            driver.close();
            res.sendStatus(500);
        })

    });
})

roomRouter.get('/adjacencies/:museum_id', (req,res) => {
    const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'emaldyst'));
    const session = driver.session();
    let museumId = req.params.museum_id;
    let adjList = {};
    let response = {
        adjacencies: {},
        start: 0,
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
        });
        response.adjacencies = adjList;
        session.run("MATCH (n)-[:START]->(a) WHERE n.id =" + museumId +" RETURN a")
        .then(dummies => {
            response.start = dummies.records[0].get('a').properties.id.toNumber();
            res.status(200).json(response);
        }).catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
    }).catch(err => {
        console.log(err);
        //res.sendStatus(500);
    });
});
export {roomRouter};
