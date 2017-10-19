import {Server} from '../src/server';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';

const expect = chai.expect;

chai.use(chaiHttp);

var server;

describe.skip('Curator', () => {

  before(() => {
    server = Server.bootstrap().app;
  });

  it('should register a new curator', (done) => {
    chai.request(server)
      .post('/curator/register')
      .send({email:"prova@prova.it", password:"1234", organization_id:1, city_id:1})
      .end((err,res) => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('should authenticate the curator', (done) => {
    chai.request(server)
      .post('/curator/auth')
      .send({email:"prova@prova.it", password:"1234"})
      .end((err,res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
