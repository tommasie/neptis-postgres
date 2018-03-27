import * as express from 'express';
import * as Sequelize from 'sequelize';
import { logger } from '../config/logger';
import { neo4jDriver, sequelize } from '../connection';
import { AttractionM, City, Curator, Museum, Room } from '../facade/models';
const neo4j = require('neo4j-driver').v1;

const museumRouter = express.Router();
museumRouter.use((req, res, next) => {
		const pathName = '[' + req.baseUrl + '] ';
		logger.info(pathName + req.method);
		next();
});

museumRouter.route('/')
		.get((req, res) => {
				const curatorId = req.query.curator_id;
				Museum.findAll({
						where: {
								curator_id: curatorId,
						},
				})
						.then((museums) => {
								res.send(museums);
						})
						.catch((err) => {
								logger.error(err);
								res.send(500);
						});
		})
		.post((req, res) => {
				logger.debug(req.body);
				Museum.create(req.body)
						.then((museum: IMuseum) => {
								const session = neo4jDriver.session();
								const create = `CREATE (:Museum {id: ${museum.id} })`;
								session.run(create)
										.then((result) => {
												res.status(201).send(museum);
										})
										.catch((err) => {
												logger.error(err);
												res.sendStatus(500);
										});
						})
						.catch((err) => {
								logger.error(err);
								res.send(500);
						});
		});

museumRouter.route('/city')
		.get((req, res) => {
				const city = req.query.city;
				const region = req.query.region;
				const query = 'SELECT museum.id, museum.name FROM museum JOIN curator on museum.curator_id = curator.id ' +
						'JOIN city ON curator.city_id = city.id WHERE city.name = :name AND city.region = :region';
				sequelize.query(query, { replacements: { name: city, region }, type: sequelize.QueryTypes.SELECT })
						.then((museums) => {
								res.status(200).send(museums);
						})
						.catch((err) => {
								logger.error(err);
								res.sendStatus(500);
						});
		});

museumRouter.route('/attractions/:museum_id')
		.get((req, res) => {
				const museumId = req.params.museum_id;
				const query = 'SELECT attraction_m.id, attraction_m.name FROM attraction_m JOIN room on attraction_m.room_id = room.id ' +
						'WHERE room.museum_id = :museum_id';
				sequelize.query(query, { replacements: { museum_id: museumId }, type: sequelize.QueryTypes.SELECT })
						.then((attractions) => {
								res.status(200).send(attractions);
						})
						.catch((err) => {
								logger.error(err);
								res.sendStatus(500);
						});
		});

museumRouter.route('/:id')
		.get((req, res) => {
				const id = +req.params.id;
				Museum.findById(id, {
						include: [
								{
										model: Room,
										include: [AttractionM],
								},
						],
						// raw: true,
				})
						.then((museum: any) => {
								const session = neo4jDriver.session();
								const adjList = {};
								const response = {
										adjacencies: {},
										start: 0,
								};
								session.run(`MATCH (a)-[:NEXT]->(b) WHERE a.museum = ${id} RETURN a,b`)
										.then((links) => {
												links.records.forEach((record) => {
														const id1 = record.get('a').properties.id.toNumber();
														const id2 = record.get('b').properties.id.toNumber();
														if (adjList[id1] === undefined) {
																adjList[id1] = [];
														}
														adjList[id1].push(id2);
														if (adjList[id2] === undefined) {
																adjList[id2] = [];
														}
												});
												response.adjacencies = adjList;
												session.run('MATCH (n)-[:START]->(a) WHERE n.id =' + id + ' RETURN a')
														.then((dummies) => {
																if (dummies.records.length !== 0) {
																		response.start = dummies.records[0].get('a').properties.id.toNumber();
																}
																let rooms = JSON.parse(JSON.stringify(museum.getDataValue('rooms')));
																rooms = rooms.map((r) => { r.adjacent = []; return r; });
																const roomIdMap = {};
																rooms.forEach((room) => {
																		roomIdMap[room.id] = room;
																});
																rooms.forEach((room) => {
																		const rr = response.adjacencies[room.id];
																		if (rr instanceof Array) {
																				for (const n of rr) {
																						logger.info(n);
																						const adjRoom = roomIdMap[n];
																						logger.info(adjRoom);
																						room.adjacent.push({ id: adjRoom.id, name: adjRoom.name });
																				}
																		}
																});
																res.status(200).send({ id: museum.id, name: museum.name, rooms });
														}).catch((err) => {
																logger.error(err);
																res.status(500).end();
														});
										});
						})
						.catch((err) => {
								logger.error(err);
								res.status(500).end();
						});
		})
		.put((req, res) => {
				Museum.update(req.body, { where: { id: +req.params.id } })
						.then((museum) => {
								res.send(museum);
						})
						.catch((err) => {
								logger.error(err);
								res.send(500);
						});
		})
		.delete((req, res) => {
				const id = +req.params.id;
				Museum.destroy({ where: { id } })
						.then(() => {
								const session = neo4jDriver.session();
								const roomId = neo4j.int(id);
								let rel = 'MATCH (r:Room {museum:' + id + '}) DETACH DELETE r';
								session.run(rel)
										.then(result => {
												logger.debug(result);
												rel = 'MATCH (m:Museum {id: ' + id + '}) DETACH DELETE m';
												session.run(rel).then(r => {
														logger.debug(result);
														session.close();
														res.sendStatus(200);
												});
										})
										.catch(err => {
												logger.error(err);
												session.close();
												res.sendStatus(500);
										});
						})
						.catch((err) => {
								logger.error(err);
								res.send(500);
						});
		});

interface IMuseum {
		id: number;
		name: string;
}

export { museumRouter };
