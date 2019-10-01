import * as Koa from 'koa';
import {constants} from 'http2';
import * as jsonld from 'jsonld';
import {Context} from 'jsonld/jsonld-spec';

interface ListRouteContext extends Koa.Context {
    params: {
        id: string,
    },
}

export default (articles: { [key: string]: object }): Koa.Middleware => {
    const context: Context = {
        'schema': 'http://schema.org/',
    };

    return async ({response, params: {id}}: ListRouteContext): Promise<void> => {
        if (!(id in articles)) {
            response.status = constants.HTTP_STATUS_NOT_FOUND;
            return;
        }

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'application/ld+json';
        response.body = await jsonld.compact(articles[id], context);
    };
};
