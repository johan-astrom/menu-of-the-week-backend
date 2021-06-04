const app = require('express')();
const cors = require('cors');

app.use(require('./api/routes'));

app.use(cors());

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server running on port: ${port}`));
