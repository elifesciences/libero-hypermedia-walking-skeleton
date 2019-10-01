import * as Koa from 'koa';
import * as logger from 'koa-logger';

const app: Koa = new Koa();

app.use(logger());

app.listen(8080, (): void => console.log('Front-end started'));
