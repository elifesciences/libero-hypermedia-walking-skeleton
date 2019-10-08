import Koa from 'koa';
import {constants} from 'http2';
import jsonld from 'jsonld';
import {Iri} from 'jsonld/jsonld-spec';
import {Nodes} from "../nodes";

interface ListRouteContext extends Koa.Context {
    params: {
        id: string,
    },
}

export default (actions: Nodes, iriGenerator: (string) => Iri): Koa.Middleware => {
    return async ({response, params: {id}}: ListRouteContext): Promise<void> => {
        const iri = iriGenerator(id);

        if (!(await actions.has(iri))) {
            response.status = constants.HTTP_STATUS_NOT_FOUND;
            return;
        }

        response.status = constants.HTTP_STATUS_OK;
        response.body = await jsonld.compact(await actions.get(iri), {});
        response.type = 'application/ld+json';
    };
};
