import * as CryptJS from 'crypto-js';
import * as express from 'express';
import { logger } from '../config/logger';

import {Tourist} from '../facade/models';

const touristRouter = express.Router();
touristRouter.use((req, res, next) => {
    next();
});

touristRouter.route('/register')
    .post((req, res) => {
      const email: string = req.body.email;
      const pw: string = CryptJS.SHA512(req.body.password).toString();
      const request = {
        email,
        password: pw,
      };
      Tourist.create(request)
        .then((tourist) => {
          res.sendStatus(201);
        })
        .catch((err) => {
          logger.error(err);
          res.sendStatus(500);
        });

    });

touristRouter.route('/auth')
    .post((req, res) => {
      const email = req.body.email;
      Tourist.findOne({where: {email}})
        .then((tourist: any) => {
          const pw = req.body.password;
          const cypher = CryptJS.SHA512(pw);
          if (tourist.password === cypher.toString()) {
            res.send(200);
          }
        })
        .catch((err) => {
          logger.error(err);
          res.send(500);
        });
    });

export {touristRouter};
