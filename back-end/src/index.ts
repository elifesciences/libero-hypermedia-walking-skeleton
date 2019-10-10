import Koa from 'koa';
import logger from 'koa-logger';
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser';
import action from './routes/action';
import article from './routes/article';
import list from './routes/list';
import postAction from './routes/post-action';
import search from './routes/search';
import register from './routes/register';
import {FileNodes, Nodes} from "./nodes";
import path from "path";

const app: Koa = new Koa();
const router: Router = new Router();

const actionIriGenerator = (id: string) => `http://localhost:8081${router.url('action', id)}`;
const articleIriGenerator = (id: string) => `http://localhost:8081${router.url('article', id)}`;
// corresponds to an actual URL backed by the API at the moment, but is that mandatory?
const userIriGenerator = (id: string) => `http://localhost:8081${router.url('user', id)}`;

const actions: Nodes = new FileNodes(path.resolve(__dirname, '../db/actions'), actionIriGenerator);
const articles: Nodes = new FileNodes(path.resolve(__dirname, '../db/articles'), articleIriGenerator);
const users: Nodes = new FileNodes(path.resolve(__dirname, '../db/users'), userIriGenerator);

router.get('list', '/', list(articles, router));
router.get('article', '/articles/:id', article(articles, articleIriGenerator));
router.get('action', '/actions/:id', action(actions, actionIriGenerator));
router.get('user', '/user/:id', article(users, userIriGenerator));
router.post('create-action', '/actions', postAction(actions, articles));
router.get('search', '/search', search(articles, router));
router.post('register', '/register', register(actions, users));

app.use(logger());
app.use(bodyParser({
    extendTypes: {
        json: ['application/ld+json'],
    },
}));
app.use(router.routes()).use(router.allowedMethods());

app.listen(8081, (): void => console.log('Back-end started at http://localhost:8081'));
