const app = require('./app');
const config = require('./config');

const PORT = config.PORT;

app.listen(PORT, () => {
    console.log(`Server is running in ${config.NODE_ENV} mode on http://localhost:${PORT}`);
});
