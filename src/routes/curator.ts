import * as CryptJS from 'crypto-js';
import * as express from 'express';
import { logger } from '../config/logger';

import { City, Curator } from '../facade/models';
import { ICurator } from '../model/model';

const curatorRouter = express.Router();

curatorRouter.get('/id/:email', (req, res) => {
    const email = req.params.email;
    Curator.findOne({
        where: { email },
    }).then((curator: ICurator) => {
        res.json(curator.id);
    }).catch(err => {
        logger.error(err);
        res.status(404).send(err);
    });
});

curatorRouter.post('/register', (req, res) => {
    const city = req.body.city;
    const region = req.body.region;
    logger.debug(city, region);
    City.findCreateFind({
        where: {
            name: city,
            region,
        },
        defaults: {
            name: city,
            region,
        },
        raw: true,
    }).then((newCity: any[]) => {
        const cityId = newCity[0].id;
        return new Promise(resolve => {
            resolve(cityId);
        });
    }).then(cityId => {
        const email = req.body.email;
        const request = {
            email,
            organization_id: 1,
            city_id: cityId,
        };
        Curator.create(request)
            .then((curator) => {
                res.status(201).send(curator);
            })
            .catch((err) => {
                logger.error(err);
                res.sendStatus(500);
            });
    });
});

curatorRouter.route('/auth')
    .post((req, res) => {
        const email = req.body.email;
        Curator.findOne({ where: { email }, rejectOnEmpty: true })
            .then((curator: any) => {
                logger.info(curator);
                if (curator.password === req.body.password) {
                    res.status(200).send({ id: curator.id });
                } else throw new Error('error');
            })
            .catch((err) => {
                res.sendStatus(500);
            });

    });

export { curatorRouter };
