import * as Sequelize from 'sequelize';
import { sequelize } from '../connection';

const options = {
    underscored: true,
    timestamps: false,
    freezeTableName: true,
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
        allowNull: false,
    },
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
        unique: true,
    },
}, {
    ...options,
    ...{indexes: [{unique: true, fields: ['email']}]},
});

Curator.belongsTo(Organization, { foreignKey: { allowNull: false } });

const City = sequelize.define('city', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'uniqueCity',
    },
    region: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'uniqueCity',
    },
}, options);

Curator.belongsTo(City, { foreignKey: { allowNull: false } });
City.hasMany(Curator, { foreignKey: { allowNull: false } });

const AttractionC = sequelize.define('attraction_c', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'nameUnique',
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    category: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    latitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
    },
    longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
    },
    radius: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
    },
    picture: {
        type: Sequelize.STRING,
        allowNull: true,
    },

    curator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'nameUnique',
    },
}, options);

Curator.hasMany(AttractionC, { foreignKey: 'curator_id' });

const Museum = sequelize.define('museum', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'museumNameUnique',
    },
    curator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'museumNameUnique',
    },
}, options);

Curator.hasMany(Museum, { foreignKey: 'curator_id' });

const Room = sequelize.define('room', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'roomNameUnique',
    },
    starting: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    museum_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'roomNameUnique',
    },
}, options);

Museum.hasMany(Room, { foreignKey: 'museum_id' });

const AttractionM = sequelize.define('attraction_m', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: 'attrMNameUnique',
    },
    category: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
    },
    picture: {
        type: Sequelize.STRING,
    },
    room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: 'attrMNameUnique',
    },
}, options);

Room.hasMany(AttractionM, { foreignKey: 'room_id' });

const Tourist = sequelize.define('tourist', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
}, options);

export { Organization, Curator, Tourist, City, AttractionC, Museum, Room, AttractionM };
