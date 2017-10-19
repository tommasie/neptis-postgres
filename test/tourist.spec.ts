import {Server} from '../src/server';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';

const expect = chai.expect;

chai.use(chaiHttp);

var server;

describe.skip('Tourist', () => {

  before(() => {
    server = Server.bootstrap().app;
  });

  it('should register a new tourist', (done) => {
    chai.request(server)
      .post('/tourist/register')
      .send({email:"prova@prova.it", password:"1234"})
      .end((err,res) => {
        expect(res).to.have.status(500);
        done();
      });
  });

  it('should authenticate the tourist', (done) => {
    chai.request(server)
      .post('/tourist/auth')
      .send({email:"prova@prova.it", password:"1234"})
      .end((err,res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
