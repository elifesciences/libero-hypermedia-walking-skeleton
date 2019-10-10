import Koa from 'koa';
import {Request} from 'koa';
import {constants} from 'http2';
import jsonld from 'jsonld';
import {Document, JsonLdArray, JsonLdObj} from 'jsonld/jsonld-spec';
import {DateTime} from 'luxon';
import {Nodes} from "../nodes";

interface PostActionRouteContext extends Koa.Context {
    request: Request & {
        body: Document,
    },
}

export default (actions: Nodes, articles: Nodes): Koa.Middleware => {
    return async ({request, response}: PostActionRouteContext): Promise<void> => {
        const expanded = <JsonLdArray>await jsonld.expand(request.body);
        const action = <JsonLdObj>expanded[0];

        if (!(action['@type'].includes('http://schema.org/CreateAction'))) {
            throw new Error(`Not a 'http://schema.org/CreateAction'`);
        }

        if (!(action['http://schema.org/result'][0]['@type'].includes('http://schema.org/Article'))) {
            throw new Error(`http://schema.org/result is not a 'http://schema.org/Article'`);
        }

        // Remove properties we know don't make sense here, allowing ones we don't know about to be kept.
        ['http://schema.org/endTime', 'http://schema.org/error', 'http://schema.org/potentialAction', 'http://schema.org/target'].forEach(property => delete action[property]);

        action['http://schema.org/actionStatus'] = 'http://schema.org/ActiveActionStatus';
        action['http://schema.org/startTime'] = DateTime.utc().toISO();

        // why are we storing the action? Strictly need to keep it around?
        await actions.add(action);

        const article = action['http://schema.org/result'][0];

        try {
            await articles.add(article);
            action['http://schema.org/result'] = {'@id': article['@id']};
            action['http://schema.org/actionStatus'] = 'http://schema.org/CompletedActionStatus';
        } catch {
            action['http://schema.org/actionStatus'] = 'http://schema.org/FailedActionStatus';
        }
        action['http://schema.org/endTime'] = DateTime.utc().toISO();

        await actions.add(action);

        response.status = constants.HTTP_STATUS_CREATED;
        response.body = await jsonld.compact(action, {});
        response.type = 'application/ld+json';
    };
};
