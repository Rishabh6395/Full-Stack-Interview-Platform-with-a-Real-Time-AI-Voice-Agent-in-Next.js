import express from 'express';
import cors from 'cors';
import formsRouter from './routes/forms.js';
import formComponent from './routes/formComponents.js';

const app = express();
const port = process.env.PORT || 5002;

app.use(express.json());
app.use(cors());
app.use(formsRouter);
app.use(formComponent);

app.listen(port, () => {
  console.log(`Builder service is running on port ${port}`);
});