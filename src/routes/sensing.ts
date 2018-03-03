import * as express from "express";
import * as logger from "winston";
import * as moment from 'moment';
import * as Sequelize from 'sequelize';
import {sequelize} from '../connection';
import {AttractionM, AttractionC} from '../models/models';
import {TQueue, TVisit, TMoveAttraction, Rating, Sensing} from '../models/sensing';
const sensingRouter = express.Router();

sensingRouter.use((req,res,next) => {
    next();
});

sensingRouter.route('/city/:id')
.get((req,res) => {
    let values: Map<number, number> = new Map<number, number>();
    let cityId = +req.params.id;
    let time = moment().subtract(1,'h').format('YYYY-MM-DD hh:mm:ss');
    time += "+02";
    let query = "SELECT avg(t_queue.minutes), attraction_c.id as id FROM sensing, t_queue, attraction_c, curator " +
    "WHERE sensing.ts >= :ts AND sensing.t_queue_id = t_queue.id AND t_queue.attraction_c_id = attraction_c.id AND attraction_c.curator_id = curator.id " +
    "AND curator.city_id = :cityId GROUP BY attraction_c.id ORDER BY attraction_c.id";

    sequelize.query(query, {
        replacements: {cityId: cityId, ts: time},
        type: sequelize.QueryTypes.SELECT
    })
    .then(queue => {
        console.log(JSON.stringify(queue));
        for(let att of queue) {
            values.set(att.id, Math.round(att.avg));
        }
        let query = "SELECT avg(t_visit.minutes), attraction_c.id as id FROM sensing, t_visit, attraction_c, curator " +
        "WHERE sensing.ts >= :ts AND sensing.t_visit_id = t_visit.id AND t_visit.attraction_c_id = attraction_c.id AND attraction_c.curator_id = curator.id " +
        "AND curator.city_id = :cityId GROUP BY attraction_c.id ORDER BY attraction_c.id";

        sequelize.query(query, {
            replacements: {cityId: cityId, ts: time},
            type: sequelize.QueryTypes.SELECT
        })
        .then(visit => {
            console.log(visit);
            for(let att of visit) {
                let id = att.id;
                let temp = values.get(id);
                if (temp == undefined)
                temp = 0;
                temp += Math.round(att.avg);
                values.set(id, temp);
            }
            console.log(values);
            let query = "SELECT attraction_c.rating as rating, attraction_c.id as id FROM attraction_c, curator " +
            "WHERE attraction_c.curator_id = curator.id AND curator.city_id = :cityId";
            sequelize.query(query, {
                replacements: {cityId: cityId, ts: time},
                type: sequelize.QueryTypes.SELECT
            })
            .then(ratings => {
                console.log(ratings);
                for(let att of ratings) {
                    let multiplier: number;
                    switch(att.rating) {
                        case 1:
                        multiplier = 3;
                        break;
                        case 2:
                        multiplier = 2;
                        break;
                        case 3:
                        multiplier = 1;
                    }
                    let id = att.id;
                    let temp = values.get(id);
                    if (temp == undefined || temp == 0)
                    temp = 1;
                    temp = 100/temp;
                    temp *= multiplier;
                    values.set(id, temp);
                }
                console.log(values);
                let obj = Object.create(null);
                for (let [k,v] of values) {
                    obj[k] = v;
                }
                res.send(obj);
            })

            .catch(err => {
                console.log(err);
            })
        })
        .catch(err => {
            console.log(err);
        })
    })
});

sensingRouter.route('/museum/:id')
.get((req,res) => {
    let values: Map<number, number> = new Map<number, number>();
    let times: Map< number, number> = new Map<number, number>();
    let museumId = +req.params.id;
    let time = moment().subtract(1,'d').format('YYYY-MM-DD hh:mm:ss');
    time += "+02";
    let query = "SELECT avg(t_queue.minutes), attraction_m.id as id FROM sensing, t_queue, attraction_m, room " +
    "WHERE sensing.ts >= :ts AND sensing.t_queue_id = t_queue.id AND t_queue.attraction_m_id = attraction_m.id AND attraction_m.room_id = room.id " +
    "AND room.museum_id = :museumId GROUP BY attraction_m.id ORDER BY attraction_m.id";

    sequelize.query(query, {
        replacements: {museumId: museumId, ts: time},
        type: sequelize.QueryTypes.SELECT
    })
    .then(queue => {
        console.log(JSON.stringify(queue));
        for(let att of queue) {
            values.set(att.id, Math.round(att.avg));
        }
        console.log(values);
        let query = "SELECT avg(t_visit.minutes), attraction_m.id as id FROM sensing, t_visit, attraction_m, room " +
        "WHERE sensing.ts >= :ts AND sensing.t_visit_id = t_visit.id AND t_visit.attraction_m_id = attraction_m.id AND attraction_m.room_id = room.id " +
        "AND room.museum_id = :museumId GROUP BY attraction_m.id ORDER BY attraction_m.id";
        sequelize.query(query, {
            replacements: {museumId: museumId, ts: time},
            type: sequelize.QueryTypes.SELECT
        })
        .then(visit => {
            console.log(visit);
            for(let att of visit) {
                let id = att.id;
                let temp = values.get(id);
                if (temp == undefined)
                temp = 0;
                temp += Math.round(att.avg);
                values.set(id, temp);
                times.set(id,temp);
            }
            console.log(values);
            let query = "SELECT attraction_m.rating as rating, attraction_m.id as id FROM attraction_m, room " +
            "WHERE attraction_m.room_id = room.id AND room.museum_id = :museumId";
            sequelize.query(query, {
                replacements: {museumId: museumId, ts: time},
                type: sequelize.QueryTypes.SELECT
            })
            .then(ratings => {
                console.log(ratings);
                for(let att of ratings) {
                    let multiplier: number;
                    switch(att.rating) {
                        case 1:
                        multiplier = 3;
                        break;
                        case 2:
                        multiplier = 2;
                        break;
                        case 3:
                        multiplier = 1;
                    }
                    let id = att.id;
                    let temp = values.get(id);
                    if (temp == undefined)
                    temp = 1;
                    temp = 100/temp;
                    temp *= multiplier;
                    values.set(id, temp);
                }
                console.log(values);
                let obj = Object.create(null);
                for (let [k,v] of values) {
                    obj[k] = Math.round(v);
                }
                let t = Object.create(null);
                console.log(times);
                for(let [k,v] of times) {
                    t[k] = v;
                }
                res.send({values:obj,times:t});
            })
            .catch(err => {
                console.log(err);
            })
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);
    })
});



sensingRouter.route('/queue')
.get((req,res) => {
    let type = req.query.type;
    let id = +req.query.id;
    let attraction = type == "museum" ? "attraction_m" : "attraction_c";
    let query = "SELECT avg(t_queue.minutes), :attraction FROM sensing, t_queue, :attraction, curator, city " +
    "WHERE sensing.t_queue_id = t_queue.id AND t_queue.:attrId = :attraction.id AND :attraction.curator_id = curator.id AND curator.city_id = :id " +
    "GROUP BY attraction_c.id ORDER BY attraction_c.id";
    sequelize.query(query, {
        replacements: {attraction: attraction, attrId: attraction + "_id", id:id},
        type: sequelize.QueryTypes.SELECT
    })
    .then(res => {
        console.log(res);
    })
    .catch(err => {
        console.log(err);
    })
})
.post((req,res) => {
    let report = req.body;
    logger.info(report);
    TQueue.findCreateFind({
        attributes: ['id'],
        where: report,
        defaults: report,
        raw:true
    }).then(response => {
        console.log("Response",response);
        Sensing.create({
            t_queue_id: +response[0]['id'],
        }).then(sensing => {
            res.status(201).send(sensing);
        }).catch(err => {
            res.sendStatus(500);
        })
    }).catch(err => {
        res.sendStatus(500);
    });
});

sensingRouter.route('/visit')
.post((req,res) => {
    let report = req.body;
    TVisit.findCreateFind({
        attributes: ['id'],
        where: report,
        defaults: report,
        raw:true
    }).then(response => {
        console.log(response);
        Sensing.create({
            t_visit_id: +response[0]['id'],
        }).then(sensing => {
            res.status(201).send(sensing);
        }).catch(err => {
            res.sendStatus(500);
        })
    }).catch(err => {
        res.sendStatus(500);
    });
});


sensingRouter.route('/moveAttraction')
.post((req,res) => {
    let report = req.body;
    TMoveAttraction.findCreateFind({
        attributes: ['id'],
        where: report,
        defaults: report,
        raw:true
    }).then(response => {
        console.log(response);
        Sensing.create({
            t_move_attraction_id: +response[0]['id'],
        }).then(sensing => {
            res.status(201).send(sensing);
        }).catch(err => {
            res.sendStatus(500);
        })
    }).catch(err => {
        res.sendStatus(500);
    });
});

sensingRouter.route('/rating')
.post((req,res) => {
    let report = req.body;
    Rating.findCreateFind({
        attributes: ['id'],
        where: report,
        defaults: report,
        raw:true
    }).then(response => {
        console.log(response);
        Sensing.create({
            rating_id: +response[0]['id'],
        }).then(sensing => {
            res.status(201).send(sensing);
        }).catch(err => {
            res.sendStatus(500);
        })
    }).catch(err => {
        res.sendStatus(500);
    });
});

export {sensingRouter};
