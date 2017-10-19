import * as express from "express";
import * as logger from "winston";
import * as CryptJS from 'crypto-js';

import {Tourist} from '../models/models';

const touristRouter = express.Router();
touristRouter.use(function(req,res,next) {
    next();
});

touristRouter.route('/register')
    .post((req,res) => {
      let email: string = req.body.email;
      let pw: string = CryptJS.SHA512(req.body.password).toString();
      let request = {
        email: email,
        password: pw,
      };
      Tourist.create(request)
        .then((tourist) => {
          res.sendStatus(201);
        })
        .catch((err) => {
          console.log(err);
          res.sendStatus(500);
        })

    });

touristRouter.route('/auth')
    .post((req,res) => {
      let email = req.body.email;
      Tourist.findOne({where:{email: email}})
        .then((tourist) => {
          let pw = req.body.password;
          let cypher = CryptJS.SHA512(pw);
          if(tourist['password'] === cypher.toString())
            res.send(200);
        })
        .catch((err) => {
          console.log(err);
          res.send(500);
        });
    });


export {touristRouter};
