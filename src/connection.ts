import * as Sequelize from 'sequelize';

//NEPTIS_PLANNER for prod code
//NEPTIS_TEST
//export const sequelize = new Sequelize('NEPTIS_PLANNER', 'postgres', 'neptis-planner', {
export const sequelize = new Sequelize('NEPTIS_TEST', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  operatorsAliases: false,
  //logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});
