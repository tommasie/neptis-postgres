import * as express from "express";
import * as logger from "winston";
import * as CryptJS from 'crypto-js';

import {City, Curator} from '../models/models';

const curatorRouter = express.Router();

curatorRouter.get('/id/:email', (req,res) => {
    let email = req.params.email;
    Curator.findOne({
        where: {email: email}
    }).then(curator => {
        res.json(curator['id']);
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    })
});

curatorRouter.route('/register')
.post((req,res) => {
    let city = req.body.city;
    let region = req.body.region;
    City.findCreateFind({
        where: {
            name: city,
            region: region
        },
        defaults: {
            name: city,
            region: region
        },
        raw: true
    }).then(newCity => {
        let cityId = newCity[0]['id'];
        return new Promise(resolve => {
            resolve(cityId);
        });
    }).then(cityId => {
        let email =  req.body.email;
        let request = {
            email: email,
            organization_id: 1,
            city_id: cityId
        };
        Curator.create(request)
        .then((curator) => {
            res.status(201).send(curator);
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(500);
        })
    })


});

curatorRouter.route('/auth')
.post((req,res) => {
    let email = req.body.email;
    Curator.findOne({where:{email: email}, rejectOnEmpty:true})
    .then((curator) => {
        console.log(curator);
        if(curator['password'] === req.body.password) {
            res.status(200).send({id:curator['id']});
        }
        else throw new Error("error");
    })
    .catch((err) => {
        res.sendStatus(500);
    })

});

export {curatorRouter};
