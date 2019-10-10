import Koa, {Request} from 'koa';
import {constants} from 'http2';
import {AxiosInstance} from 'axios';
import jsonld from 'jsonld';
import {JsonLdArray, JsonLdObj} from 'jsonld/jsonld-spec';
import Router from 'koa-router';
import btoa from 'btoa';
import {fetch, findPotentialAction} from '../utils';
import urlTemplate from 'url-template';

interface RegisterRouteContext extends Koa.Context {
    request: Request & {
        body: Document,
    },
}

export default (client: AxiosInstance, router: Router): Koa.Middleware => {
    return async ({request, response}: RegisterRouteContext): Promise<void> => {
        const registerAction = <JsonLdObj>(await jsonld.expand(JSON.parse(request.body.action)))[0];

        if (!(registerAction)) {
            response.status = constants.HTTP_STATUS_NOT_FOUND;
            return;
        }

        const givenName: string = request.body['given-name'];
        // this should be way more generic
        let newAction = {
            "@type": "http://schema.org/RegisterAction",
            "http://schema.org/agent": {
                "@type":"http://schema.org/Person",
                "http://schema.org/givenName":givenName,
            }
        };

        // also assumes no templating
        const targetUrl = registerAction['http://schema.org/target'][0]['http://schema.org/urlTemplate'][0]['@value'];
        console.log(targetUrl);
        const serverResponse = await client({
            method: registerAction['http://schema.org/target'][0]['http://schema.org/httpMethod'][0]['@value'],
            url: targetUrl,
            data: newAction,
        });
        const expanded = <JsonLdArray>await jsonld.expand(serverResponse.data);
        const completedAction = <JsonLdObj>expanded[0];
        console.log(completedAction);

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'html';
        // could possibly load this, if it was implemented
        // or anyway implement a front end page for this rather than linking to the API from this layer
        let body = `Registration completed for ${completedAction['http://schema.org/agent'][0]['@id']}`;
        response.body = body;
    }
};
