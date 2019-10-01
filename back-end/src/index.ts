import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as Router from 'koa-router'
import article from './routes/article';
import list from './routes/list';
import {Articles, InMemoryArticles} from "./articles";

const app: Koa = new Koa();
const router: Router = new Router();

const articles: Articles = new InMemoryArticles();

router.get('list', '/', list(articles));
router.get('article', '/articles/:id', article(articles));

app.use(logger());
app.use(router.routes()).use(router.allowedMethods());

articles.add({
    '@type': 'http://schema.org/Article',
    '@id': 'http://localhost:8081/articles/09560',
    'http://schema.org/name': 'Homo naledi, a new species of the genus Homo from the Dinaledi Chamber, South Africa',
});
articles.add({
    '@type': 'http://schema.org/Article',
    '@id': 'http://localhost:8081/articles/24231',
    'http://schema.org/name': 'The age of Homo naledi and associated sediments in the Rising Star Cave, South Africa',
});

app.listen(8081, (): void => console.log('Back-end started'));
