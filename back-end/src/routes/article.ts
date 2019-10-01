import * as Koa from 'koa';
import {constants} from 'http2';
import * as jsonld from 'jsonld';
import {Context} from 'jsonld/jsonld-spec';
import {Articles} from "../articles";

interface ListRouteContext extends Koa.Context {
    params: {
        id: string,
    },
}

export default (articles: Articles): Koa.Middleware => {
    const context: Context = {
        'schema': 'http://schema.org/',
    };

    return async ({response, params: {id}}: ListRouteContext): Promise<void> => {
        const iri = `http://localhost:8081/articles/${id}`;

        if (!(articles.has(iri))) {
            response.status = constants.HTTP_STATUS_NOT_FOUND;
            return;
        }

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'application/ld+json';
        response.body = await jsonld.compact(articles.get(iri), context);
    };
};
