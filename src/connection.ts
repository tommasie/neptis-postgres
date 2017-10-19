import * as Sequelize from 'sequelize';

export const sequelize = new Sequelize('NEPTIS_PLANNER', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
  //logging: false,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});
