import Koa from 'koa';
import {constants} from 'http2';
import jsonld from 'jsonld';
import {Context, Document, JsonLdObj} from 'jsonld/jsonld-spec';
import {Nodes} from "../nodes";
import Router from "koa-router";

interface ListRouteContext extends Koa.Context {
}

export default (articles: Nodes, router: Router): Koa.Middleware => {
    const context: Context = 'http://schema.org/';

    return async ({response}: ListRouteContext): Promise<void> => {
        const createActionRoute = router.route('create-action');

        const list: Document = {
            '@type': 'http://schema.org/Collection',
            'http://schema.org/name': 'List of articles',
            'http://schema.org/hasPart': [...articles.all()].map((object: JsonLdObj): string => object['@id']),
            'http://schema.org/potentialAction': [{
                '@type': 'http://schema.org/CreateAction',
                'http://schema.org/target': {
                    '@type': 'http://schema.org/EntryPoint',
                    'http://schema.org/httpMethod': createActionRoute.methods,
                    'http://schema.org/urlTemplate': createActionRoute.url({}),
                    'http://schema.org/encodingType': 'application/ld+json',
                },
                'http://schema.org/result': {
                    '@type': 'http://schema.org/Article',
                    'http://schema.org/name-input': 'required',
                },
            }],
        };

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'application/ld+json';
        response.body = await jsonld.compact(list, context);
    };
};
