import * as Koa from 'koa';
import {constants} from 'http2';
import * as jsonld from 'jsonld';
import {Context, Document, JsonLdObj} from 'jsonld/jsonld-spec';
import {Articles} from "../articles";

interface ListRouteContext extends Koa.Context {
}

export default (articles: Articles): Koa.Middleware => {
    const context: Context = {
        'schema': 'http://schema.org/',
    };

    return async ({response}: ListRouteContext): Promise<void> => {
        const list: Document = {
            '@type': 'http://schema.org/Collection',
            'http://schema.org/name': 'List of articles',
            'http://schema.org/hasPart': [...articles.all()].map((object: JsonLdObj): string => object['@id']),
        };

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'application/ld+json';
        response.body = await jsonld.compact(list, context);
    };
};
