import Koa, {Request} from 'koa';
import {constants} from 'http2';
import jsonld from 'jsonld';
import {Document, JsonLdArray, JsonLdObj} from 'jsonld/jsonld-spec';
import {Nodes} from '../nodes';
import Router from 'koa-router';

// maybe this should be unified with post-action.ts?
interface RegisterRouteContext extends Koa.Context {
    request: Request & {
        body: Document,
    },
}

export default (articles: Nodes, router: Router): Koa.Middleware => {
    return async ({request, response}: RegisterRouteContext): Promise<void> => {
        const expanded = <JsonLdObj>await jsonld.expand(request.body);
        console.log(expanded);
        const action = expanded[0];
        console.log(action['http://schema.org/agent'][0]);
        console.log(action['http://schema.org/agent'][0]['http://schema.org/givenName'][0]['@value']);

        if (!(action['@type'].includes('http://schema.org/RegisterAction'))) {
            throw new Error(`Not a 'http://schema.org/RegisterAction'`);
        }

        response.status = constants.HTTP_STATUS_OK;
        response.body = await jsonld.compact({}, {});
        response.type = 'application/ld+json';
    };
};
