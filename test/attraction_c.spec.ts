import {Server} from '../src/server';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';

const expect = chai.expect;

chai.use(chaiHttp);

var server;

describe('AttractionC', () => {

  before(() => {
    server = Server.bootstrap().app;
  });

  it('should add a SINGLE attraction on /attractions POST', (done) => {
    chai.request(server)
      .post('/attractionc')
      .send({id: 1,
        name: 'Fontana di Trevi',
        latitude: 41.900933,
        longitude: 12.483313,
        radius: 100,
        description: 'descrizione',
        curator_id: 11
      })
      .end((err,res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.equal('1');
        expect(res.body.name).to.equal('Fontana di Trevi');
        expect(res.body.latitude).to.equal(41.900933);
        expect(res.body.longitude).to.equal(12.483313);
        expect(res.body.radius).to.equal(100);
        done();
      });
  });

  it('should list ALL attractions on /attractions GET', (done) => {
    chai.request(server)
      .get('/attractionc')
      .end((err,res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(1);
        done();
      });
  });
  it('should list a SINGLE attraction on /attraction/<id> GET', (done) => {
    chai.request(server)
      .get('/attractionc/1')
      .end((err,res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        console.log("TYPEOF ID", typeof(res.body.id));
        expect(res.body.id).to.equal(1);
        expect(res.body.name).to.equal('Fontana di Trevi');
        expect(res.body.latitude).to.equal(41.900933);
        expect(res.body.longitude).to.equal(12.483313);
        expect(res.body.radius).to.equal(100);
        done();
      });
  });
  it('should update a SINGLE attraction on /attraction/<id> PUT', (done) => {
    chai.request(server)
      .put('/attractionc/1')
      .send({
        name: 'Fontana di Trevi',
        latitude: 41.900933,
        longitude: 12.483313,
        radius: 10,
        description: 'desc',
        curator_id: 11
      })
      .end((err,res) => {
        expect(res).to.have.status(204);
        done();
      });
  });
  it('should delete a SINGLE attraction on /attraction/<id> DELETE', (done) => {
    chai.request(server)
      .del('/attractionc/1')
      .end((err,res) => {
        expect(res).to.have.status(204);
        done();
      });
  });
});
