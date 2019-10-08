import Koa from 'koa';
import {constants} from 'http2';
import {AxiosInstance} from 'axios';
import jsonld from 'jsonld';
import {JsonLdObj} from 'jsonld/jsonld-spec';
import btoa from 'btoa';
import Router from 'koa-router';
import escapeHTML from 'escape-html';
import {fetch, findPotentialAction} from '../utils';

interface HomepageRouteContext extends Koa.Context {
}

export default (client: AxiosInstance, router: Router): Koa.Middleware => {
    return async ({response}: HomepageRouteContext): Promise<void> => {
        const list = await fetch(client, '/', 'http://schema.org/Collection');

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'html';

        let body: string = '<html><body><h1>Homepage</h1>';

        // Need to find out the individual items to get their title.
        // Ideally solved with server push? (Maybe embedding? Is it possible to do a partial embed?)
        const parts: Array<[string, Promise<JsonLdObj>]> = (list['http://schema.org/hasPart'] || []).reduce(
            (carry: Array<[string, Promise<JsonLdObj>]>, part: JsonLdObj): Array<[string, Promise<JsonLdObj>]> => {
                carry.push([part['@value'], fetch(client, part['@value'], 'http://schema.org/Article')]);

                return carry;
            }, []
        );

        if (parts.length) {
            body += '<h2>Articles</h2><ol>';

            for (const [id, object] of parts) {
                const article = await object;

                // Assume the value is a string (if present), need to check for the language and type (could be HTML, or
                // something weird that we don't understand).
                body += `<li><a href="${router.url('article', btoa(id))}">${article['http://schema.org/name'][0]['@value'] || 'Unknown article'}</a></li>`
            }

            body += '</ol>';
        } else {
            body += '<p>No articles available.</p>';
        }

        const searchAction = findPotentialAction(list, 'http://schema.org/SearchAction');

        if (searchAction) {
            body += '<h2>Search</h2>';
            body += `<form action="${router.url('search', {})}" method="get">`;
            body += '<label>Keyword <input type="text" name="keyword"></label><br>';
            body += '<input type="submit" value="Search">';
            body += '</form>';
        }

        const createAction = findPotentialAction(list, 'http://schema.org/CreateAction', 'http://schema.org/Article');

        if (createAction) {
            body += '<h2>Create an article</h2>';
            body += `<form action="${router.url('create-article', {})}" method="post">`;
            body += '<label>Name <input type="text" name="fields.name"></label><br>';
            body += `<input type="hidden" name="action" value="${escapeHTML(JSON.stringify(await jsonld.compact(createAction, {})))}">`;
            body += '<input type="submit" value="Add">';
            body += '</form>';
        }

        body += '</body></html>';

        response.body = body;
    };
};
