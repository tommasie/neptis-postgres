import * as bodyParser from "body-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";

import {cityRouter} from './routes/city';
import {attractionCRouter} from './routes/attraction_c';
import {attractionMRouter} from './routes/attraction_m';
import {museumRouter} from './routes/museum';
import {roomRouter} from './routes/room';
import {organizationRouter} from './routes/organization';

import {curatorRouter} from './routes/curator';
import {touristRouter} from './routes/tourist';

import {sensingRouter} from './routes/sensing';


export class Server {
  public app: express.Application;

  public static bootstrap(): Server {
    return new Server();
  }
  constructor() {
    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //add routes
    this.routes();

  }

  public config() {
    //use logger middlware
    this.app.use(logger("dev"));

    //use json form parser middlware
    this.app.use(bodyParser.json());

    //use query string parser middlware
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));
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
