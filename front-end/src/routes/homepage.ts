import * as Koa from 'koa';
import {constants} from 'http2';
import {AxiosInstance} from 'axios';
import * as jsonld from 'jsonld';
import {JsonLdArray, JsonLdObj} from 'jsonld/jsonld-spec';

interface HomepageRouteContext extends Koa.Context {
}

export default (client: AxiosInstance): Koa.Middleware => {
    return async ({response}: HomepageRouteContext): Promise<void> => {
        const listResponse = await client.get('/');
        const expanded = <JsonLdArray>await jsonld.expand(listResponse.data);
        const list = <JsonLdObj>expanded[0];

        if (!(list['@type'].includes('http://schema.org/Collection'))) {
            throw new Error('Not a collection');
        }

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'html';

        let body: string = '<html><body><h1>Homepage</h1>';

        const parts: Array<string> = (list['http://schema.org/hasPart'] || []).map((part: JsonLdObj): string => part['@value']);

        if (parts.length) {
            body += '<h2>Articles</h2><ol>';
            parts.forEach((part: string): string => body += `<li>${part}</li>`);
            body += '</ol>';
        } else {
            body += '<p>No articles available.</p>';
        }

        body += '</body></html>';

        response.body = body;
    };
};
