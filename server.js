/* eslint-disable no-console */
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import bodyParser from 'body-parser';

import api from './src/api/';
import config from './webpack.config';

const port = process.env.PORT || 3000;

const app = express();
const compiler = webpack(config);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true,
  },
}));

app.use('/api', api);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Listening at http://localhost:${port}`);
});
