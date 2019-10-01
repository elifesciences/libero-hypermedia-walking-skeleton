import * as Koa from 'koa';
import {constants} from 'http2';
import * as jsonld from 'jsonld';
import {Context, Document} from 'jsonld/jsonld-spec';

interface ListRouteContext extends Koa.Context {
}

export default (): Koa.Middleware => {
    const context: Context = {
        'schema': 'http://schema.org/',
    };

    const list: Document = {
        '@type': 'http://schema.org/Collection',
        'http://schema.org/name': 'List of articles',
    };

    return async ({response}: ListRouteContext): Promise<void> => {
        response.status = constants.HTTP_STATUS_OK;
        response.type = 'application/ld+json';
        response.body = await jsonld.compact(list, context);
    };
};
