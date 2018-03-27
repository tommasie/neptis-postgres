import * as CryptoJS from 'crypto-js';
import { logger } from './config/logger';
import {neo4jDriver} from './connection';
import * as all from './facade/models';
import * as sensing from './facade/sensing';
import {IAttractionC, ICity, ICurator, IOrganization} from './model/model';

const btstrap = {
		org: {name: 'MIBACT'},
		city: {name: 'Bracciano', region: 'Lazio'},
		curator: {email: 'thomas@bracciano.it'},
		attractionC: {name: 'Castello', category: 'Medioevo', latitude: 42.103827, longitude: 12.177444, radius: 100, description: 'Descrizione del castello'},
};
all.Organization.sync({ force: true }).then(() => {
		all.Organization.create(btstrap.org).then((org: IOrganization) => {
				all.City.sync({ force: true }).then(() => {
						all.City.create(btstrap.city).then((city: ICity) => {
								all.Curator.sync({ force: true }).then(() => {
										all.Curator.create({
												email: btstrap.curator.email,
												organization_id: org.id,
												city_id: city.id,
										}).then((curator: ICurator) => {
												all.AttractionC.sync({ force: true }).then(() => {
														all.AttractionC.create(
																// Spread syntax
																{...btstrap.attractionC, ...{curator_id: curator.id}},
														).then(attractionC => {
																all.Museum.sync({ force: true }).then(() => {
																		all.Room.sync({ force: true }).then(() => {
																				all.AttractionM.sync({ force: true }).then(() => {
																						sensing.TQueue.sync({ force: true }).then(() => {
																								sensing.TVisit.sync({ force: true }).then(() => {
																										sensing.TMoveAttraction.sync({ force: true }).then(() => {
																												sensing.Rating.sync({ force: true }).then(() => {
																														sensing.Sensing.sync({ force: true }).then(() => {
																																return;
																														});
																												});
																										});
																								});
																						});
																				});
																		});
																});
														});
												});
										});
								});
						});
				});
		});
});

/*all.Organization.sync({ force: true }).then(() => {
    all.Organization.create({
        name: "MIBACT"
    }).then(org => {
        all.City.sync({ force: true }).then(() => {
            all.City.create({
                name: "Bracciano",
                region: "Lazio"
            }).then(city => {
                return new Promise((resolve, reject) => {resolve(city);});
            });
        });
    });
})
.then(org => {
    all.City.sync({ force: true }).then(() => {
        all.City.create({
            name: "Bracciano",
            region: "Lazio"
        }).then(city => {
            all.Curator.sync({ force: true }).then(() => {
                all.Curator.create({
                    email: "collerton.1674085@studenti.uniroma1.it",
                    organization_id: org['id'],
                    city_id: city['id']
                }).then(curator => {
                    return new Promise((resolve, reject) => {resolve(curator);});
                });
            });
        });
    });
})
.then(curator => {
    all.AttractionC.sync({ force: true }).then(() => {
        all.AttractionC.create({
            name: "Castello",
            category: "Medioevo",
            latitude: 42.103827,
            longitude: 12.177444,
            radius: 100,
            description: "Descrizione del castello",
            curator_id: curator['id']
        }).then(attractionC => {

        });
    });
    all.Museum.sync({ force: true }).then(() => {
        all.Room.sync({ force: true }).then(() => {
            all.AttractionM.sync({ force: true }).then(() => {
                return new Promise((resolve,reject) => { resolve(); });
            });
        });
    });
})
.then(() => {
    sensing.TQueue.sync({ force: true }).then(() => {
        sensing.TVisit.sync({ force: true }).then(() => {
            sensing.TMoveAttraction.sync({ force: true }).then(() => {
                sensing.Rating.sync({ force: true }).then(() => {
                    sensing.Sensing.sync({ force: true }).then(() => {
                        return new Promise((resolve,reject) => { resolve(); });
                    });
                })
            })
        })
    })
})
.then(() => {
    all.Tourist.sync({ force: true });
})
.catch(err => {
    console.error(err);
});*/

all.Tourist.sync({ force: true });

const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'emaldyst'));
const rel = 'MATCH (n) DETACH DELETE n';
const session = driver.session();
session.run(rel)
		.then(result => {
				logger.info(result);
				session.close();
				driver.close();
		})
		.catch(err => {
				logger.error(err);
				session.close();
				driver.close();
		});
