import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as ipfilter from 'express-ipfilter';
import * as morgan from 'morgan';
import * as path from 'path';
import {logger} from './config/logger';
import {attractionCRouter} from './routes/attraction_c';
import {attractionMRouter} from './routes/attraction_m';
import {cityRouter} from './routes/city';
import {museumRouter} from './routes/museum';
import {organizationRouter} from './routes/organization';
import {roomRouter} from './routes/room';

import {curatorRouter} from './routes/curator';
import {touristRouter} from './routes/tourist';

import {sensingRouter} from './routes/sensing';

export class Server {

  public static bootstrap(): Server {
    return new Server();
  }

  public app: express.Application;

  constructor() {
    // create expressjs application
    this.app = express();

    // configure application
    this.config();

    // add routes
    this.routes();

  }

  public config() {
    // use logger middlware
    this.app.use(morgan('dev'));

    // use json form parser middlware
    this.app.use(bodyParser.json());

    // use query string parser middlware
    this.app.use(bodyParser.urlencoded({
      extended: true,
    }));

    // Only allow localhost calls
    this.app.use(ipfilter.IpFilter(['127.0.0.1'], {mode: 'allow'}));

    this.app.use((err, req, res, next) => {
      logger.debug('Error handler', err);
      if (err instanceof ipfilter.IpDeniedError) {
        res.status(401).end();
      } else {
        res.status(err.status || 500).end();
      }
    });
  }

  public routes() {
    this.app.use('/organizations', organizationRouter);
    this.app.use('/cities', cityRouter);
    this.app.use('/attractionc', attractionCRouter);
    this.app.use('/attractionm', attractionMRouter);
    this.app.use('/museums', museumRouter);
    this.app.use('/curator', curatorRouter);
    this.app.use('/tourist', touristRouter);
    this.app.use('/room', roomRouter);
    this.app.use('/sensing', sensingRouter);
  }

}
