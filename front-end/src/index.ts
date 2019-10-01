import axios from 'axios';
import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as Router from 'koa-router';
import homepage from './routes/homepage';

const app: Koa = new Koa();
const router: Router = new Router();

const client = axios.create({
    baseURL: 'http://localhost:8081',
});

router.get('/', homepage(client));

app.use(logger());
app.use(router.routes()).use(router.allowedMethods());

app.listen(8080, (): void => console.log('Front-end started'));
