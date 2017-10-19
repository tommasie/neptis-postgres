import {sequelize} from '../connection';
import * as Sequelize from 'sequelize';

const options = {
  underscored: true,
  timestamps: false,
  freezeTableName: true
};

const Organization = sequelize.define('organization', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  }
}, options);

const Curator = sequelize.define('curator', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, options);

Curator.belongsTo(Organization, {foreignKey: {allowNull:false}});
//Curator.belongsTo(Organization);

const City = sequelize.define('city', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: 'uniqueCity'
  },
  region: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: 'uniqueCity'
  },
}, options);

Curator.belongsTo(City, {foreignKey: {allowNull:false}});
City.hasMany(Curator, {foreignKey: {allowNull:false}})

const AttractionC = sequelize.define('attraction_c', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  latitude: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  longitude: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  radius: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  rating: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  picture: {
    type: Sequelize.BLOB,
    allowNull: true
  }
}, options);

Curator.hasMany(AttractionC, {foreignKey: {allowNull:false}});

const Museum = sequelize.define('museum', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
}, options);

Curator.hasMany(Museum, {foreignKey: {allowNull:false}});

const Room = sequelize.define('room', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
}, options);

Museum.hasMany(Room, {foreignKey: {allowNull:false}});

const StartEnd  = sequelize.define('start_end', {
}, options);

StartEnd.belongsTo(Museum, {foreignKey: 'museum_id'});
StartEnd.belongsTo(Room, {foreignKey: 'start_id'});
StartEnd.belongsTo(Room, {foreignKey: 'end_id'});

const Adjacency = sequelize.define('adjacency', {
    id: {
        type:Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    }
}, options);

Adjacency.belongsTo(Room, {foreignKey: {name: 'room1_id'}});
Adjacency.belongsTo(Room, {foreignKey: {name: 'room2_id'}});

const AttractionM = sequelize.define('attraction_m', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  rating: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  picture: {
    type: Sequelize.BLOB
  }
}, options);

Room.hasMany(AttractionM, {foreignKey: {allowNull:false}});

const Tourist = sequelize.define('tourist', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
},options);

export {Organization, Curator, Tourist, City, AttractionC, Museum, Room, StartEnd, Adjacency, AttractionM};
