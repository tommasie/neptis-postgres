import * as config from 'config';
import * as Sequelize from 'sequelize';
const neo4j = require('neo4j-driver').v1;

const postgresDB = config.get('postgresDB');
const postgresUser = config.get('postgresUser');
const postgresPass = config.get('postgresPass');

export const sequelize = new Sequelize(postgresDB, postgresUser, postgresPass, {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

const neo4jDB = config.get('neo4JDB');
const neo4jUser = config.get('neo4JUser');
const neo4jPass = config.get('neo4JPass');
export const neo4jDriver = neo4j.driver(neo4jDB, neo4j.auth.basic(neo4jUser, neo4jPass));
