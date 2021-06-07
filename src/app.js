const app = require('express')();

app.use(require('./api/routes'));

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`server running on port: ${port}`));
