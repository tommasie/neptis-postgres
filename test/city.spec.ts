import {Server} from '../src/server';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import 'mocha';

const expect = chai.expect;

chai.use(chaiHttp);

var server = Server.bootstrap().app;
/*beforeEach(() => {
  chai.request(server);
})*/
describe('Cities', () => {
  it('should list ALL cities on /cities GET', (done) => {
    chai.request(server)
      .get('/cities')
      .end((err,res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(1);
        done();
      });
  });
  it('should list a SINGLE city on /city/<id> GET', (done) => {
    chai.request(server)
      .get('/cities/1')
      .end((err,res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.equal(1);
        expect(res.body.name).to.equal('Bracciano');
        expect(res.body.region).to.equal('Lazio');
        done();
      });
  });
  it('should add a SINGLE city on /cities POST', (done) => {
    chai.request(server)
      .post('/cities')
      .send({id: 2, name: 'Roma', region: 'Lazio'})
      .end((err,res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.equal(2);
        expect(res.body.name).to.equal('Roma');
        expect(res.body.region).to.equal('Lazio');
        done();
      });
  });
  it('should update a SINGLE city on /city/<id> PUT', (done) => {
    chai.request(server)
      .put('/cities/2')
      .send({name: 'Viterbo', region: 'Lazio'})
      .end((err,res) => {
        expect(res).to.have.status(204);
        done();
      });
  });
  it('should delete a SINGLE city on /city/<id> DELETE', (done) => {
    chai.request(server)
      .del('/cities/2')
      .end((err,res) => {
        expect(res).to.have.status(204);
        done();
      });
  });
});
