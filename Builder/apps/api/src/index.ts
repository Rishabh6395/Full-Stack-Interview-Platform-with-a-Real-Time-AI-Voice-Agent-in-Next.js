import express from 'express'
import formsRouter from '../routes/forms.js'
import cors from 'cors'
import db from '../db/db.js'

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use(formsRouter);



app.post('/api/v1/insert', async (req, res) => {
    const { flagKey, flagValue } = req.body;

    try {
        const queryText = 'INSERT INTO feature_flags (flag_key, flag_value) VALUES ($1, $2) RETURNING *';
        const result = await db.query(queryText, [flagKey, flagValue]);
        res.json(result.rows[0]); // pg returns rows as a flat array of objects
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
})

app.get('/api/v1/flags/:key', async (req, res) => {
  const flagKey = req.params.key;

  try {
    const queryText = 'SELECT * FROM feature_flags WHERE flag_key = $1';
    const result = await db.query(queryText, [flagKey]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    res.json(result.rows[0]); // pg returns rows as a flat array of objects
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})
