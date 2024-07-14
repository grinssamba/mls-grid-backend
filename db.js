import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: '127.0.0.1', // Ensure this is the correct host
  dialect: 'mysql',
});

export default sequelize;