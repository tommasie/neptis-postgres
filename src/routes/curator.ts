import * as express from "express";
import * as logger from "winston";
import * as CryptJS from 'crypto-js';

import {Curator} from '../models/models';

const curatorRouter = express.Router();
curatorRouter.use(function(req,res,next) {
    next();
});

curatorRouter.route('/register')
    .post((req,res) => {
      let email: string = req.body.email;
      let pw: string = CryptJS.SHA3(req.body.password).toString();
      let request = {
        email: email,
        password: pw,
        organization_id: req.body.organization_id,
        city_id: req.body.city_id
      };
      Curator.create(request)
        .then((curator) => {
          res.sendStatus(201);
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        })

    });

curatorRouter.route('/auth')
    .post((req,res) => {
      let email = req.body.email;
      Curator.findOne({where:{email: email}, rejectOnEmpty:true})
        .then((curator) => {
          console.log(curator);
          let pw = req.body.password;
          let cypher = CryptJS.SHA3(pw);
          if(curator['password'] === cypher.toString())
            res.send(200);
        })
        .catch((err) => {
          res.sendStatus(500);
        })

    });

export {curatorRouter};
