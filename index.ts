import express from 'express';
import { getIdListFromS3 } from './getIdListFromS3';

const app = express();
const port = 3000;

// test2
app.get('/', async (req, res) => {
    const ids = await getIdListFromS3();
    res.send(ids);
    // conflict!!!!
});

app.listen(port, () => {
    // conflict!!!!
    console.log(`Example app listening on port ${port}`);
    // conflict!!!!
});
// ma
