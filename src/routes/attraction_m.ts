import * as express from 'express';
import { logger } from '../config/logger';
import { sequelize } from '../connection';
import { AttractionM } from '../facade/models';
import { TQueue, TVisit, Rating, Sensing } from '../facade/sensing';

const attractionMRouter = express.Router();
attractionMRouter.use((req, res, next) => {
	const pathName = '[' + req.baseUrl + '] ';
	logger.info(pathName + req.method);
	next();
});

attractionMRouter.route('/')
	.get((req, res) => {
		AttractionM.findAll()
			.then((attractions) => {
				res.send(attractions);
			})
			.catch((err) => {
				logger.error(err);
				res.send(500);
			});
	})
	.post((req, res) => {
		logger.info(req.body);
		AttractionM.create(req.body)
			.then((attraction) => {
				let report = {attraction_m_id: attraction['id'], minutes: 2};
				let rating = {attraction_m_id: attraction['id'], value: 2};
				sendSensing(report,rating, res, attraction);
				//res.send(attraction);
			})
			.catch((err) => {
				logger.error(err);
				res.send(500);
			});
	});

attractionMRouter.route('/museum')
	.get((req, res) => {
		const museumId = req.query.id;
		const query = 'SELECT attraction_m.id, attraction_m.name, attraction_m.rating FROM attraction_m JOIN room on attraction_m.room_id = room.id ' +
			'WHERE room.museum_id = :id';
		sequelize.query(query, { replacements: { id: museumId }, type: sequelize.QueryTypes.SELECT })
			.then(attractions => {
				res.status(200).send(attractions);
			})
			.catch(err => {
				res.sendStatus(500);
			});
	});

attractionMRouter.route('/city')
	.get((req, res) => {
		const city = req.query.city;
		const region = req.query.region;
		const query = 'SELECT attraction_m.id, attraction_m.name FROM attraction_m JOIN room on attraction_m.room_id = room.id ' +
			'JOIN museum ON room.museum_id = museum.id JOIN curator ON museum.curator_id = curator.id JOIN city ON curator.city_id = city.id ' +
			'WHERE city.name = :name AND city.region = :region';
		sequelize.query(query, { replacements: { name: city, region }, type: sequelize.QueryTypes.SELECT })
			.then(attractions => {
				res.status(200).send(attractions);
			})
			.catch(err => {
				res.sendStatus(500);
			});
	});

attractionMRouter.route('/:id')
	.get((req, res) => {
		const id = +req.params.id;
		AttractionM.findById(id)
			.then((attraction) => {
				res.send(attraction);
			})
			.catch((err) => {
				logger.error(err);
				res.send(500);
			});
	})
	.put((req, res) => {
		AttractionM.update(req.body, { where: { id: +req.params.id } })
			.then((attraction) => {
				res.send(attraction);
			})
			.catch((err) => {
				logger.error(err);
				res.send(500);
			});
	})
	.delete((req, res) => {
		let img;
		AttractionM.findById(+req.params.id, { attributes: ['picture'], raw: true })
			.then(pic => {
				img = pic;
				return AttractionM.destroy({ where: { id: +req.params.id } });
			}).then(() => {
				res.status(200).json(img);
			}).catch((err) => {
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
export { attractionMRouter };
