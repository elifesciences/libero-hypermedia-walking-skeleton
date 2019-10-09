import Koa, {Request} from 'koa';
import {constants} from 'http2';
import jsonld from 'jsonld';
import {Document, JsonLdArray, JsonLdObj} from 'jsonld/jsonld-spec';
import {Nodes} from '../nodes';
import Router from 'koa-router';

interface RegisterRouteContext extends Koa.Context {
    request: Request & {
        query: {
            keyword: string,
        },
    },
}

export default (articles: Nodes, router: Router): Koa.Middleware => {
    return async ({request, response}: RegisterRouteContext): Promise<void> => {
        const expanded = <JsonLdObj>await jsonld.expand(request.body);
        console.log(expanded[0]);
        console.log(expanded[0]['http://schema.org/agent'][0]);
        console.log(expanded[0]['http://schema.org/agent'][0]['http://schema.org/givenName'][0]['@value']);

        response.status = constants.HTTP_STATUS_OK;
        response.body = await jsonld.compact({}, {});
        response.type = 'application/ld+json';
    };
};
