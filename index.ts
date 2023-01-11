import express from 'express';
import { getIdListFromS3 } from './getIdListFromS3';

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    const ids = await getIdListFromS3();
    res.send(ids);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
