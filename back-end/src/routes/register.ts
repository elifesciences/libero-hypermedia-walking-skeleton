import Koa, {Request} from 'koa';
import {constants} from 'http2';
import jsonld from 'jsonld';
import {Document, JsonLdArray, JsonLdObj} from 'jsonld/jsonld-spec';
import {DateTime} from 'luxon';
import {Nodes} from '../nodes';

// maybe this should be unified with post-action.ts?
interface RegisterRouteContext extends Koa.Context {
    request: Request & {
        body: Document,
    },
}

export default (actions: Nodes, users: Nodes): Koa.Middleware => {
    return async ({request, response}: RegisterRouteContext): Promise<void> => {
        const expanded = <JsonLdObj>await jsonld.expand(request.body);
        let action = expanded[0];

        if (!(action['@type'].includes('http://schema.org/RegisterAction'))) {
            throw new Error(`Not a 'http://schema.org/RegisterAction'`);
        }

        // Remove properties we know don't make sense here, allowing ones we don't know about to be kept.
        // Adapt this from CreateAction to RegisterAction
        //['http://schema.org/endTime', 'http://schema.org/error', 'http://schema.org/potentialAction', 'http://schema.org/target'].forEach(property => delete action[property]);

        action['http://schema.org/actionStatus'] = 'http://schema.org/ActiveActionStatus';
        action['http://schema.org/startTime'] = DateTime.utc().toISO();

        await actions.add(action);
        console.log(action['@id']);
        const user = action['http://schema.org/agent'][0];

        try {
            await users.add(user);
            action['http://schema.org/agent'] = {
                '@id': user['@id'],
            }
            action['http://schema.org/actionStatus'] = 'http://schema.org/CompletedActionStatus';
        } catch {
            action['http://schema.org/actionStatus'] = 'http://schema.org/FailedActionStatus';
        }
        action['http://schema.org/endTime'] = DateTime.utc().toISO();

        await actions.add(action);
        response.status = constants.HTTP_STATUS_OK;
        response.body = await jsonld.compact(action, {});
        response.type = 'application/ld+json';
    };
};
