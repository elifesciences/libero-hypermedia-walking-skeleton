import Koa, {Request} from 'koa';
import {constants} from 'http2';
import {AxiosInstance} from 'axios';
import jsonld from 'jsonld';
import {JsonLdObj} from 'jsonld/jsonld-spec';
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
        await client({
            method: registerAction['http://schema.org/target'][0]['http://schema.org/httpMethod'][0]['@value'],
            url: targetUrl,
            data: newAction,
        });

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'html';
        let body = 'Registration completed, output not implemented yet';
        response.body = body;
    }
};
