import express from 'express';
import cors from 'cors';
import { MONOREPO_CONSTANT, add } from '@repo/math';
import { dateNow, managePassword } from '@repo/date';

const app = express();
const port = 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.json({
        message: "Hello from API",
        test: JSON.stringify(managePassword()),
        constant: MONOREPO_CONSTANT,
        mathCheck: `1 + 1 = ${add(1, 1)}`,
        dateNow: dateNow()
    });
});

app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`);
});