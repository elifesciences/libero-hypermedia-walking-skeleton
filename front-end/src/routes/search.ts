import Koa, {Request} from 'koa';
import {constants} from 'http2';
import {AxiosInstance} from 'axios';
import {JsonLdObj} from 'jsonld/jsonld-spec';
import Router from 'koa-router';
import btoa from 'btoa';
import {fetch, findPotentialAction} from '../utils';
import urlTemplate from 'url-template';

interface SearchRouteContext extends Koa.Context {
    request: Request & {
        query: {
            keyword: string,
        },
    },
}

export default (client: AxiosInstance, router: Router): Koa.Middleware => {
    return async ({request, response}: SearchRouteContext): Promise<void> => {
        // Need to find the search action again to know if it's available/how to perform it, this should be cached.
        const searchAction = findPotentialAction(await fetch(client, '/', 'http://schema.org/Collection'), 'http://schema.org/SearchAction');

        if (!(searchAction)) {
            response.status = constants.HTTP_STATUS_NOT_FOUND;
            return;
        }

        const keyword: string = request.query.keyword || '';
        const keywordParameter = searchAction['http://schema.org/query-input'][0]['http://schema.org/valueName']['0']['@value'];
        const target = urlTemplate.parse(searchAction['http://schema.org/target'][0]['@value']);
        const results = await fetch(client, target.expand({[keywordParameter]: keyword}), 'http://schema.org/ItemList');

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'html';

        let body: string = `<html><body><a href="${router.url('homepage', {})}">Home</a><h1>Search</h1>`;

        const parts: Array<[string, Promise<JsonLdObj>]> = (results['http://schema.org/itemListElement'] || []).reduce(
            (carry: Array<[string, Promise<JsonLdObj>]>, part: JsonLdObj): Array<[string, Promise<JsonLdObj>]> => {
                carry.push([part['@value'], fetch(client, part['@value'], 'http://schema.org/Article')]);

                return carry;
            }, []
        );

        if (parts.length) {
            body += '<h2>Results</h2><ol>';

            for (const [id, object] of parts) {
                const article = await object;

                body += `<li><a href='${router.url('article', btoa(id))}'>${article['http://schema.org/name'][0]['@value'] || 'Unknown article'}</a></li>`
            }

            body += '</ol>';
        } else {
            body += '<p>No articles found.</p>';
        }

        body += '<h2>New search</h2>';
        body += `<form action="${router.url('search', {})}" method="get">`;
        body += `<label>Keyword <input type="text" name="keyword" value="${keyword}"></label><br>`;
        body += '<input type="submit" value="Search">';
        body += '</form>';

        body += '</body></html>';

        response.body = body;
    }
};
