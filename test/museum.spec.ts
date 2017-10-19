import {Server} from '../src/server';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';

const expect = chai.expect;

chai.use(chaiHttp);

var server;

describe('Museum', () => {

  before(() => {
    server = Server.bootstrap().app;
  });

  it.skip('should add a new museum via /museums POST', (done) => {
    chai.request(server)
      .post('/museums')
      .send({
        name: "Museo Prova",
        curator_id: 11,
        rooms: [
          {
            name: "Sala Prova",
            attraction_ms: [
              {
                name: "Statua Prova"
              }
            ]
          }
        ]
      })
      .end((err,res) => {
        expect(res).to.have.status(201);
        done();
      });
  });
  it('should list all available museums via /museums GET', done => {
    chai.request(server)
      .get('/museums')
      .end((err,res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(2);
      })
  })
});
