import {Server} from '../src/server';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';

const expect = chai.expect;

chai.use(chaiHttp);

var server;

describe('Organizations', () => {

  before(() => {
    server = Server.bootstrap().app;
  });

  it('should add a SINGLE organization on /organizations POST', (done) => {
    chai.request(server)
      .post('/organizations')
      .send({id: 200, name: 'MIB'})
      .end((err,res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.equal(200);
        expect(res.body.name).to.equal('MIB');
        done();
      });
  });
  it('should list ALL organizations on /organizations GET', (done) => {
    chai.request(server)
      .get('/organizations')
      .end((err,res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(2);
        done();
      });
  });
  it('should list a SINGLE organization on /organization/<id> GET', (done) => {
    chai.request(server)
      .get('/organizations/200')
      .end((err,res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.equal(200);
        expect(res.body.name).to.equal('MIB');
        done();
      });
  });
  it('should update a SINGLE organization on /organization/<id> PUT', (done) => {
    chai.request(server)
      .put('/organizations/200')
      .send({name: 'La Sapienza'})
      .end((err,res) => {
        expect(res).to.have.status(204);
        done();
      });
  });
  it('should delete a SINGLE organization on /organization/<id> DELETE', (done) => {
    chai.request(server)
      .del('/organizations/200')
      .end((err,res) => {
        expect(res).to.have.status(204);
        done();
      });
  });
});
