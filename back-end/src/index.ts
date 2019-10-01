import * as Koa from 'koa';
import * as logger from 'koa-logger';

const app: Koa = new Koa();

app.use(logger());

app.listen(8081, (): void => console.log('Back-end started'));
