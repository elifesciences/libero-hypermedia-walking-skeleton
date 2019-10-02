import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as Router from 'koa-router'
import article from './routes/article';
import list from './routes/list';
import {FileNodes, Nodes} from "./nodes";
import * as path from "path";

const app: Koa = new Koa();
const router: Router = new Router();

const articleIriGenerator = (id: string) => `http://localhost:8081${router.url('article', id)}`;

const articles: Nodes = new FileNodes(path.resolve(__dirname, '../db'), articleIriGenerator);

router.get('list', '/', list(articles));
router.get('article', '/articles/:id', article(articles, articleIriGenerator));

app.use(logger());
app.use(router.routes()).use(router.allowedMethods());

(async (): Promise<void> => {
    await Promise.all([
        articles.add({
            '@type': 'http://schema.org/Article',
            'http://schema.org/name': 'Homo naledi, a new species of the genus Homo from the Dinaledi Chamber, South Africa',
        }),
        articles.add({
            '@type': 'http://schema.org/Article',
            'http://schema.org/name': 'The age of Homo naledi and associated sediments in the Rising Star Cave, South Africa',
        }),
    ]);
})();

app.listen(8081, (): void => console.log('Back-end started'));
