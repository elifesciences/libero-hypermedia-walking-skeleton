import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as Router from 'koa-router';
import list from './routes/list';

const app: Koa = new Koa();
const router: Router = new Router();

router.get('/', list());

app.use(logger());
app.use(router.routes()).use(router.allowedMethods());

app.listen(8081, (): void => console.log('Back-end started'));
