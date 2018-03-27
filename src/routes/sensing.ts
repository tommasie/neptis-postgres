import * as express from 'express';
import * as moment from 'moment';
import * as Sequelize from 'sequelize';
import { logger } from '../config/logger';
import { sequelize } from '../connection';
import { AttractionC, AttractionM } from '../facade/models';
import { Rating, Sensing, TMoveAttraction, TQueue, TVisit } from '../facade/sensing';
const sensingRouter = express.Router();

sensingRouter.use((req, res, next) => {
		next();
});

sensingRouter.route('/city/:id')
		.get((req, res) => {
				const values: Map<number, number> = new Map<number, number>();
				const times: Map<number, number> = new Map<number, number>();
				const cityId = +req.params.id;
				let time = moment().subtract(1, 'M').format('YYYY-MM-DD hh:mm:ss');
				time += '+02';
				const queueQuery = 'SELECT avg(t_queue.minutes), attraction_c.id as id FROM sensing, t_queue, attraction_c, curator ' +
						'WHERE sensing.ts >= :ts AND sensing.t_queue_id = t_queue.id AND t_queue.attraction_c_id = attraction_c.id AND attraction_c.curator_id = curator.id ' +
						'AND curator.city_id = :cityId GROUP BY attraction_c.id ORDER BY attraction_c.id';

				sequelize.query(queueQuery, {
						replacements: { cityId, ts: time },
						type: sequelize.QueryTypes.SELECT,
				})
						.then(queue => {
								logger.info(JSON.stringify(queue));
								for (const att of queue) {
										values.set(att.id, Math.round(att.avg));
								}
								const visitQuery = 'SELECT avg(t_visit.minutes), attraction_c.id as id FROM sensing, t_visit, attraction_c, curator ' +
										'WHERE sensing.ts >= :ts AND sensing.t_visit_id = t_visit.id AND t_visit.attraction_c_id = attraction_c.id AND attraction_c.curator_id = curator.id ' +
										'AND curator.city_id = :cityId GROUP BY attraction_c.id ORDER BY attraction_c.id';

								sequelize.query(visitQuery, {
										replacements: { cityId, ts: time },
										type: sequelize.QueryTypes.SELECT,
								})
										.then(visit => {
												logger.info(visit);
												for (const att of visit) {
														const id = att.id;
														let temp = values.get(id);
														if (temp === undefined) {
																temp = 0;
														}
														temp += Math.round(att.avg);
														values.set(id, temp);
														times.set(id, temp);
												}
												logger.info(values.toString());
												const ratingsQuery = 'SELECT avg(rating.value), attraction_c.id as id FROM sensing, rating, attraction_c, curator ' +
														'WHERE sensing.ts >= :ts AND sensing.rating_id = rating.id AND rating.attraction_c_id = attraction_c.id AND attraction_c.curator_id = curator.id ' +
														'AND curator.city_id = :cityId GROUP BY attraction_c.id ORDER BY attraction_c.id';
												sequelize.query(ratingsQuery, {
														replacements: { cityId, ts: time },
														type: sequelize.QueryTypes.SELECT,
												})
														.then(ratings => {
																logger.info(ratings);
																for (const att of ratings) {
																		let multiplier: number;
																		switch (att.rating) {
																				case 1:
																						multiplier = 3;
																						break;
																				case 2:
																						multiplier = 2;
																						break;
																				case 3:
																						multiplier = 1;
																		}
																		const id = att.id;
																		let temp = values.get(id);
																		if (temp === undefined || temp === 0) {
																				temp = 1;
																		}
																		temp = 100 / temp;
																		temp *= multiplier;
																		values.set(id, temp);
																}
																logger.info(values.toString());
																const obj = Object.create(null);
																for (const [k, v] of values) {
																		obj[k] = v;
																}
																const t = Object.create(null);
																logger.info(times.toString());
																for (const [k, v] of times) {
																		t[k] = v;
																}
																res.send({ values: obj, times: t });
														})

														.catch(err => {
																logger.error(err);
														});
										})
										.catch(err => {
												logger.error(err);
										});
						});
		});

sensingRouter.route('/museum/:id')
.get((req, res) => {
const values: Map<number, number> = new Map<number, number>();
const times: Map<number, number> = new Map<number, number>();
const museumId = +req.params.id;
let time = moment().subtract(1, 'd').format('YYYY-MM-DD hh:mm:ss');
time += '+02';
const queueQuery = 'SELECT avg(t_queue.minutes), attraction_m.id as id FROM sensing, t_queue, attraction_m, room ' +
		'WHERE sensing.ts >= :ts AND sensing.t_queue_id = t_queue.id AND t_queue.attraction_m_id = attraction_m.id AND attraction_m.room_id = room.id ' +
		'AND room.museum_id = :museumId GROUP BY attraction_m.id ORDER BY attraction_m.id';

sequelize.query(queueQuery, {
		replacements: { museumId, ts: time },
		type: sequelize.QueryTypes.SELECT,
})
		.then(queue => {
				logger.info(JSON.stringify(queue));
				for (const att of queue) {
						values.set(att.id, Math.round(att.avg));
				}
				logger.info(values.toString());
				const visitsQuery = 'SELECT avg(t_visit.minutes), attraction_m.id as id FROM sensing, t_visit, attraction_m, room ' +
						'WHERE sensing.ts >= :ts AND sensing.t_visit_id = t_visit.id AND t_visit.attraction_m_id = attraction_m.id AND attraction_m.room_id = room.id ' +
						'AND room.museum_id = :museumId GROUP BY attraction_m.id ORDER BY attraction_m.id';
				sequelize.query(visitsQuery, {
						replacements: { museumId, ts: time },
						type: sequelize.QueryTypes.SELECT,
				})
						.then(visit => {
								logger.info(visit);
								for (const att of visit) {
										const id = att.id;
										let temp = values.get(id);
										if (temp === undefined) {
												temp = 0;
										}
										temp += Math.round(att.avg);
										values.set(id, temp);
										times.set(id, temp);
								}
								logger.info(values.toString());
								const ratingsQuery = 'SELECT avg(rating.value), attraction_m.id as id FROM sensing, rating, attraction_m, room ' +
										'WHERE sensing.ts >= :ts AND sensing.rating_id = rating.id AND rating.attraction_m_id = attraction_m.id AND attraction_m.room_id = room.id ' +
										'AND room.museum_id = :museumId GROUP BY attraction_m.id ORDER BY attraction_m.id';
								sequelize.query(ratingsQuery, {
										replacements: { museumId, ts: time },
										type: sequelize.QueryTypes.SELECT,
								})
										.then(ratings => {
												logger.info(ratings);
												for (const att of ratings) {
														let multiplier: number;
														switch (att.rating) {
																case 1:
																		multiplier = 3;
																		break;
																case 2:
																		multiplier = 2;
																		break;
																case 3:
																		multiplier = 1;
														}
														const id = att.id;
														let temp = values.get(id);
														if (temp === undefined) {
																temp = 1;
														}
														temp = 100 / temp;
														temp *= multiplier;
														values.set(id, temp);
												}
												logger.info(values.toString());
												const obj = Object.create(null);
												for (const [k, v] of values) {
														obj[k] = Math.round(v);
												}
												const t = Object.create(null);
												logger.info(times.toString());
												for (const [k, v] of times) {
														t[k] = v;
												}
												res.send({ values: obj, times: t });
										})
										.catch(err => {
												logger.error(err);
										});
						})
						.catch(err => {
								logger.error(err);
						});
		})
		.catch(err => {
				logger.error(err);
		});
	});

sensingRouter.route('/queue')
		.get((req, res) => {
				const type = req.query.type;
				const id = +req.query.id;
				const attraction = type === 'museum' ? 'attraction_m' : 'attraction_c';
				const query = 'SELECT avg(t_queue.minutes), :attraction FROM sensing, t_queue, :attraction, curator, city ' +
						'WHERE sensing.t_queue_id = t_queue.id AND t_queue.:attrId = :attraction.id AND :attraction.curator_id = curator.id AND curator.city_id = :id ' +
						'GROUP BY attraction_c.id ORDER BY attraction_c.id';
				sequelize.query(query, {
						replacements: { attraction, attrId: attraction + '_id', id },
						type: sequelize.QueryTypes.SELECT,
				})
						.then(resp => {
								logger.info(resp);
						})
						.catch(err => {
								logger.error(err);
						});
		})
		.post((req, res) => {
				const report = req.body;
				logger.info(report);
				TQueue.findCreateFind({
						attributes: ['id'],
						where: report,
						defaults: report,
						raw: true,
				}).then((response: any[]) => {
						logger.info('Response', response);
						Sensing.create({
								t_queue_id: +response[0].id,
						}).then(sensing => {
								res.status(201).send(sensing);
						}).catch(err => {
							logger.error(err);
							res.sendStatus(500);
						});
				}).catch(err => {
                    logger.error(err);
                    res.sendStatus(500);
				});
		});

sensingRouter.route('/visit')
		.post((req, res) => {
				const report = req.body;
				TVisit.findCreateFind({
						attributes: ['id'],
						where: report,
						defaults: report,
						raw: true,
				}).then((response: any[]) => {
						logger.info(response.toString());
						Sensing.create({
								t_visit_id: +response[0].id,
						}).then(sensing => {
								res.status(201).send(sensing);
						}).catch(err => {
							logger.error(err);
							res.sendStatus(500);
						});
				}).catch(err => {
					logger.error(err);
					res.sendStatus(500);
				});
		});

sensingRouter.route('/moveAttraction')
		.post((req, res) => {
				const report = req.body;
				TMoveAttraction.findCreateFind({
						attributes: ['id'],
						where: report,
						defaults: report,
						raw: true,
				}).then((response: any[]) => {
						logger.info(response.toString());
						Sensing.create({
								t_move_attraction_id: +response[0].id,
						}).then(sensing => {
								res.status(201).send(sensing);
						}).catch(err => {
								res.sendStatus(500);
						});
				}).catch(err => {
						res.sendStatus(500);
				});
		});

sensingRouter.route('/rating')
		.post((req, res) => {
				const report = req.body;
				Rating.findCreateFind({
					attributes: ['id'],
					where: report,
					defaults: report,
					raw: true,
				}).then((response: any[]) => {
					logger.info(response.toString());
					Sensing.create({
						rating_id: +response[0].id,
					}).then(sensing => {
						res.status(201).send(sensing);
					}).catch(err => {
						logger.error(err);
						res.sendStatus(500);
					});
				}).catch(err => {
					logger.error(err);
					res.sendStatus(500);
				});
		});

export { sensingRouter };
