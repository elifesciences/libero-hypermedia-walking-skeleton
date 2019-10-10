import axios from 'axios';
import {requestLogger, responseLogger} from 'axios-logger';
import Koa from 'koa';
import logger from 'koa-logger';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import HttpProxyAgent from 'http-proxy-agent';
import article from './routes/article';
import createArticle from './routes/create-article';
import homepage from './routes/homepage';
import search from './routes/search';
import register from './routes/register';

const app: Koa = new Koa();
const router: Router = new Router();

// Needed when using Docker as 'http://localhost:8081' is the public API, but it's connecting through an internal one.
const proxy = new HttpProxyAgent(process.env.API_URI || 'http://localhost:8081');

const client = axios.create({
    baseURL: 'http://localhost:8081',
    httpAgent: proxy,
});
client.interceptors.request.use(requestLogger);
client.interceptors.response.use(responseLogger);

router.get('homepage', '/', homepage(client, router));
router.get('article', '/articles/:id', article(client, router));
router.post('create-article', '/articles', createArticle(client, router));
router.get('search', '/search', search(client, router));
router.post('register', '/register', register(client, router));

app.use(logger());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, (): void => console.log('Front-end started at http://localhost:8080'));
