import Ajv from 'ajv';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import sequelize from './db.js';
import { Realtor } from './models/Realtor.js'; // Ensure correct import for Realtor
import { router as propertyRoutes } from './routes/propertyRoutes.js'; // Use named import for propertyRoutes

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
  origin: 'http://localhost:3000',
}));

const ajv = new Ajv();
const validateToken = (schema, data) => {
  const validate = ajv.compile(schema);
  return validate(data);
};

// Middleware for authenticating API requests
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== process.env.MLS_GRID_API_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
});

app.use(express.json());
app.use('/api', propertyRoutes);

// Ensure the Sequelize connection is established and the server is running
sequelize.authenticate()
  .then(async () => {
    console.log('Connection has been established successfully.');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database & tables created!');

    const [, created] = await Realtor.findOrCreate({
      where: { email: 'jonathasferrazcampbell@gmail.com' },
      defaults: {
        firstName: 'Jonathas',
        lastName: 'Ferraz Campbell',
        phone: '407-574-9082',
        bio: 'Your biography goes here...',
        profilePictureUrl: 'https://example.com/your-profile-picture.jpg'
      }
    });

    if (created) {
      console.log('Default realtor created!');
    } else {
      console.log('Realtor already exists.');
    }

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.get('/get-property-details', async (req, res) => {
  const size = req.query.size || 10;
  const mls_active = req.query.mls_active || true;
  const state = req.query.state || 'IL';

  try {
    const response = await axios({
      method: 'get',
      url: 'https://api.mlsgrid.com/v2/Property',
      headers: {
        'Authorization': `Bearer ${process.env.MLS_GRID_API_TOKEN}`
      },
      params: {
        $filter: `OriginatingSystemName eq 'actris' and MlgCanView eq true and ModificationTimestamp gt 2020-12-30T23:59:59.99Z`,
        $expand: 'Media,Rooms,UnitTypes',
        $top: size,
        mls_active: mls_active,
        state: state
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});