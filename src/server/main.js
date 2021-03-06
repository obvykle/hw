import config from './config';
import errorHandler from './lib/errorHandler';
import express from 'express';
import frontend from './frontend';
import raven from 'raven';
import fs from 'fs';

const sentryClient = new raven.Client(config.isProduction && config.sentryServerSideUrl);
if (config.isProduction) {
  sentryClient.patchGlobal(() => {
    console.log('Bye, bye, world.');
    process.exit(1);
  });
}

const app = express();

app.get('/favicon.ico', (req, res) => {
  res.send('');
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(fs.readFileSync(`${__dirname}/robots.txt`));
});

app.get('/sitemap.txt', (req, res) => {
  res.type('text/plain');
  res.send(fs.readFileSync(`${__dirname}/sitemap.txt`));
});

const apiRouter = express.Router();
apiRouter.route('/images')
  .get((req, res, next) => {
    const images = [
      {
        _id: 1,
        title: 'Cat',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg01.jpg',
      },
      {
        _id: 2,
        title: 'Rocks',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg02.jpg',
      },
      {
        _id: 3,
        title: 'Street & Dog',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg03.jpg',
      },
      {
        _id: 4,
        title: 'Phone',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg04.jpg',
      },
      {
        _id: 5,
        title: 'Wall',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg05.jpg',
      },
      {
        _id: 6,
        title: 'Dog',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg06.jpg',
      },
      {
        _id: 7,
        title: 'Bridge',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg07.jpg',
      },
      {
        _id: 8,
        title: 'Tower',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg08.jpg',
      },
      {
        _id: 9,
        title: 'Bike',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg09.jpg',
      },
      {
        _id: 10,
        title: 'Faces',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg10.jpg',
      },
      {
        _id: 11,
        title: 'Tower 2',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg08.jpg',
      },
      {
        _id: 12,
        title: 'Bike 2',
        url: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/placeimg09.jpg',
      },
    ];
    res.json(images);
  });

app.use('/api', apiRouter);
app.use(frontend);
app.use(errorHandler);


if (config.isProduction) app.use(raven.middleware.express(config.sentryServerSideUrl));

app.listen(config.port, () => {
  console.log(`Server started at http://localhost:${config.port}`);
});
