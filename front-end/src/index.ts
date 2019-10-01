import axios from 'axios';
import {requestLogger} from 'axios-logger';
import Koa from 'koa';
import logger from 'koa-logger';
import Router from 'koa-router';
import article from './routes/article';
import homepage from './routes/homepage';

const app: Koa = new Koa();
const router: Router = new Router();

const client = axios.create({
    baseURL: 'http://localhost:8081',
});
client.interceptors.request.use(requestLogger);

router.get('homepage', '/', homepage(client, router));
router.get('article', '/articles/:id', article(client, router));

app.use(logger());
app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, (): void => console.log('Front-end started'));
