const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const app = require('../app');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('./../knexfile')[environment];
const database = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {

});

describe('API Routes', () => {
  before((done) => {
    database.migrate.latest()
    .then(() => done())
    .catch(error => {
      throw error;
    });
  });
  beforeEach((done) => {
    database.seed.run()
    .then(() => done())
    .catch(error => {
      throw error;
    });
  });

  describe('GET /api/v1/meals', () => {
    it('should return all of the meals', done => {
       chai.request(app)
      .get('/api/v1/meals')
      .end((err, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(4);
        response.body[0].should.have.property('name');
        response.body[0].title.should.equal('Breakfast');
        response.body[0].should.have.property('foods');
        response.body[0].author.should.be.a('array');
        done();
      });
    });
  });

  describe('POST /api/v1/meals/:meal_id/foods/:id', () => {
    it('should add a food to a meal if valid ids and return a 201', done => {
      chai.request(app)
      .get('/api/v1/meals')
      .end((err, response) => {
        let meal_id = response.body[0].id
        let meal_name = response.body[0].name
        chai.request(app)
        .get('/api/v1/foods')
        .end((err, response) => {
          let food_id = response.body[0].id
          let food_name = response.body[0].name
          chai.request(app)
          .post(`/api/v1/meals/${meal_id}/foods/${food_id}`)
          .end((err, response) => {
            response.should.have.status(201);
            response.should.be.json;
            response.body.should.have.property('message');
            repsonse.body.message.should.equal(`Successfully added ${food_name} to ${meal_name}`);
            done();
          });
        });
      });
    });

    it('should not add a food to a meal if invalid ids and return a 404', done => {
      chai.request(app)
      .get('/api/v1/meals')
      .end((err, response) => {
        let meal_id = response.body[0].id
        let meal_name = response.body[0].name
        chai.request(app)
        .post(`/api/v1/meals/${meal_id}/foods/77`)
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
      });
    });
  });
});