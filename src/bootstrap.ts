import * as all from './models/models';
import * as sensing from './models/sensing';
import * as CryptoJS from 'crypto-js';

all.Organization.sync({force:true}).then(() => {
    all.Organization.create({
        name: "MIBACT"
    }).then(org => {
        all.City.sync({force:true}).then(() => {
            all.City.create({
                name: "Bracciano",
                region: "Lazio"
            }).then(city => {
                all.Curator.sync({force:true}).then(() => {
                    all.Curator.create({
                        email: "prova@prova.it",
                        organization_id: org['id'],
                        city_id: city['id']
                    }).then(curator => {
                        all.AttractionC.sync({force:true}).then(() => {
                            all.AttractionC.create({
                                name: "Castello",
                                latitude: 42.103827,
                                longitude: 12.177444,
                                radius: 100,
                                curator_id: curator['id']
                            }).then((attractionC => {
                                all.Museum.sync({force:true}).then(() => {
                                    all.Museum.create({
                                        name: "Museo",
                                        curator_id: curator['id']
                                    }).then(museum => {
                                        all.Room.sync({force:true}).then(() => {
                                            all.Room.create({
                                                name: "Stanza A",
                                                museum_id: museum['id']
                                            }).then(room => {
                                                all.AttractionM.sync({force:true}).then(() => {
                                                    all.AttractionM.create({
                                                        name: "Quadro",
                                                        room_id: room['id']
                                                    }).then(attractionM => {
                                                        sensing.TQueue.sync({force:true}).then(() => {
                                                            sensing.TVisit.sync({force:true}).then(() => {
                                                                sensing.TMoveAttraction.sync({force:true}).then(() => {
                                                                    sensing.Rating.sync({force:true}).then(() => {
                                                                        sensing.Sensing.sync({force:true}).then(() => {
                                                                            return;
                                                                        });
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        });
                                    })
                                });
                            }))
                        });
                    })
                });
            })
        })
    })
});

all.Tourist.sync({force:true});
