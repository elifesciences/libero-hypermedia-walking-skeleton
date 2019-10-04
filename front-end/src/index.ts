import axios from 'axios';
import {responseLogger, requestLogger} from 'axios-logger';
import Koa from 'koa';
import logger from 'koa-logger';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import article from './routes/article';
import createArticle from './routes/create-article';
import homepage from './routes/homepage';
import search from './routes/search';

const app: Koa = new Koa();
const router: Router = new Router();

const client = axios.create({
    baseURL: 'http://localhost:8081',
});
client.interceptors.request.use(requestLogger);
client.interceptors.response.use(responseLogger);

router.get('homepage', '/', homepage(client, router));
router.get('article', '/articles/:id', article(client, router));
router.post('create-article', '/articles', createArticle(client, router));
router.get('search', '/search', search(client, router));

app.use(logger());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, (): void => console.log('Front-end started at http://localhost:8080'));
