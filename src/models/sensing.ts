import {sequelize} from '../connection';
import * as Sequelize from 'sequelize';

import {AttractionC, AttractionM, Room, Adjacency} from './models';
const options = {
  underscored: true,
  timestamps: false,
  freezeTableName: true
};

const TQueue = sequelize.define('t_queue', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  minutes: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, options);
TQueue.belongsTo(AttractionC);
TQueue.belongsTo(AttractionM);
TQueue.belongsTo(Room);

const TVisit = sequelize.define('t_visit', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  minutes: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, options);
TVisit.belongsTo(AttractionC);
TVisit.belongsTo(AttractionM);
TVisit.belongsTo(Room);

const TMoveAttraction = sequelize.define('t_move_attraction', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  minutes: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, options);
TMoveAttraction.belongsTo(AttractionC, {foreignKey: 'attraction1'});
TMoveAttraction.belongsTo(AttractionC, {foreignKey: 'attraction2'});

const TMoveRoom = sequelize.define('t_move_room', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  minutes: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, options);
TMoveRoom.belongsTo(Adjacency, {foreignKey: 'rooms'});

const Rating = sequelize.define('rating', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  rating: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, options);
Rating.belongsTo(AttractionC);
Rating.belongsTo(AttractionM);

const Sensing = sequelize.define('sensing', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  ts: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  }
}, options);
Sensing.belongsTo(TQueue);
Sensing.belongsTo(TVisit);
Sensing.belongsTo(TMoveAttraction);
Sensing.belongsTo(TMoveRoom);
Sensing.belongsTo(Rating);

export {TQueue, TVisit, TMoveAttraction, TMoveRoom, Rating, Sensing};
