import * as express from 'express';
import * as Sequelize from 'sequelize';
import { logger } from '../config/logger';
const neo4j = require('neo4j-driver').v1;
import { neo4jDriver, sequelize } from '../connection';
import { AttractionC, City, Curator } from '../facade/models';
import { TQueue, TVisit, Rating, Sensing } from '../facade/sensing';
import { IAttractionC } from '../model/model';

const attractionCRouter = express.Router();
attractionCRouter.use((req, res, next) => {
	next();
});
attractionCRouter.route('/')
	.get((req, res) => {
		const curatorId = req.query.curator_id;
		AttractionC.findAll({
			where: {
				curator_id: curatorId,
			},
		})
			.then(attractions => {
				res.send(attractions);
			})
			.catch((err) => {
				logger.error(err);
				res.send(500);
			});
	})
	.post((req, res) => {
		logger.debug(req.body);
		AttractionC.create(req.body)
			.then((attraction: IAttractionC) => {
				// Create node on neo4j
				/*const session = neo4jDriver.session();
				const create = `CREATE (:AttractionC {id: ${attraction.id}, curator_id: ${attraction.city_id}
					lat: ${attraction.latitude}, lng: ${attraction.longitude} })`;
				session.run(create)
					.then((result) => {
						const others = "MATCH (a :AttractionC {"
						session.close();
						res.status(201).send(attraction);
					})
					.catch((err) => {
						session.close();
						logger.error(err);
						res.sendStatus(500);
					});*/
					let report = {attraction_c_id: attraction.id, minutes: 2};
					let rating = {attraction_c_id: attraction['id'], value: 2};
					sendSensing(report, rating, res, attraction);
			})
			.catch((err) => {
				logger.error(err);
				res.send(500);
			});
	});

attractionCRouter.route('/planning')
	.get((req, res) => {
		const city = req.query.name;
		const region = req.query.region;
		const query = 'SELECT attraction_c.*, city.id as city_id FROM attraction_c JOIN curator on attraction_c.curator_id = curator.id ' +
			'JOIN city ON curator.city_id = city.id WHERE city.name = :name AND city.region = :region';
		sequelize.query(query, { raw: true, replacements: { name: city, region }, type: sequelize.QueryTypes.SELECT })
			.then(attractions => {
				logger.info(attractions);
				res.status(200).send(attractions);
			})
			.catch(err => {
				logger.error(err);
				res.sendStatus(500);
			});
	});

attractionCRouter.route('/city')
	.get((req, res) => {
		const city = req.query.city;
		const region = req.query.region;
		const query = 'SELECT attraction_c.id, attraction_c.name, attraction_c.rating FROM attraction_c JOIN curator on attraction_c.curator_id = curator.id ' +
			'JOIN city ON curator.city_id = city.id WHERE city.name = :name AND city.region = :region';
		sequelize.query(query, { replacements: { name: city, region }, type: sequelize.QueryTypes.SELECT })
			.then(attractions => {
				res.status(200).send(attractions);
			})
			.catch(err => {
				logger.error(err);
				res.sendStatus(500);
			});
	});

attractionCRouter.route('/:id')
	.get((req, res) => {
		const id = +req.params.id;
		AttractionC.findById(id)
			.then(attraction => {
				res.send(attraction);
			})
			.catch((err) => {
				logger.error(err);
				res.send(500);
			});
	})
	.put((req, res) => {
		AttractionC.update(req.body, { where: { id: +req.params.id } })
			.then((attraction) => {
				res.status(204).send(attraction);
			})
			.catch((err) => {
				logger.error(err);
				res.send(500);
			});
	})
	.delete((req, res) => {
		AttractionC.destroy({ where: { id: +req.params.id } })
			.then(() => {
				res.sendStatus(204);
			})
			.catch((err) => {
				logger.error(err);
				res.send(500);
			});
	});

	function sendSensing(report: object, rating: object, res, attraction): void {
		TQueue.findCreateFind({
			attributes: ['id'],
			where: report,
			defaults: report,
			raw: true,
		}).then((response: any[]) => {
			logger.info('Response', response);
			return Sensing.create({
					t_queue_id: +response[0].id,
			});
		}).then(sensing => {
			TVisit.findCreateFind({
				attributes: ['id'],
				where: report,
				defaults: report,
				raw: true,
		}).then((response: any[]) => {
				logger.info(response.toString());
				return Sensing.create({
						t_visit_id: +response[0].id,
				})
		}).then(sensing => {
			
			Rating.findCreateFind({
				attributes: ['id'],
				where: rating,
				defaults: rating,
				raw: true,
			}).then((response: any[]) => {
				logger.info(response.toString());
				return Sensing.create({
					rating_id: +response[0].id,
				})
			}).then(sensing => {
				res.status(201).send(attraction);
				})
			})
		}).catch(err => {
			logger.error(err);
			res.sendStatus(500);
		});
	}

export { attractionCRouter };
