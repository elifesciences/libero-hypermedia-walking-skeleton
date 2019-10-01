import Koa from 'koa';
import {constants} from 'http2';
import {AxiosInstance} from 'axios';
import jsonld from 'jsonld';
import {JsonLdArray, JsonLdObj} from 'jsonld/jsonld-spec';
import btoa from 'btoa';
import Router from 'koa-router';

interface HomepageRouteContext extends Koa.Context {
}

export default (client: AxiosInstance, router: Router): Koa.Middleware => {
    const fetch = async (uri: string, type: string): Promise<JsonLdObj> => {
        const listResponse = await client.get(uri);
        const expanded = <JsonLdArray>await jsonld.expand(listResponse.data);
        const object = <JsonLdObj>expanded[0];

        if (!(object['@type'].includes(type))) {
            throw new Error(`Not a ${type}`);
        }

        return object;
    };

    return async ({response}: HomepageRouteContext): Promise<void> => {
        const list = await fetch('/', 'http://schema.org/Collection');

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'html';

        let body: string = '<html><body><h1>Homepage</h1>';

        const parts: Array<[string, Promise<JsonLdObj>]> = (list['http://schema.org/hasPart'] || []).reduce(
            (carry: Array<[string, Promise<JsonLdObj>]>, part: JsonLdObj): Array<[string, Promise<JsonLdObj>]> => {
                carry.push([part['@value'], fetch(part['@value'], 'http://schema.org/Article')]);

                return carry;
            }, []
        );

        if (parts.length) {
            body += '<h2>Articles</h2><ol>';

            for (const [id, object] of parts) {
                const article = await object;

                body += `<li><a href="${router.url('article', btoa(id))}">${article['http://schema.org/name'][0]['@value'] || 'Unknown article'}</a></li>`
            }

            body += '</ol>';
        } else {
            body += '<p>No articles available.</p>';
        }

        body += '</body></html>';

        response.body = body;
    };
};
