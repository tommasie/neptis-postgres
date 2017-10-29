import * as Sequelize from 'sequelize';
//NEPTIS_PLANNER for prod code
export const sequelize = new Sequelize('NEPTIS_TEST', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  //logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});
