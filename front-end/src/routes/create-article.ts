import Koa, {Request} from 'koa';
import {constants} from 'http2';
import {AxiosInstance} from 'axios';
import jsonld from 'jsonld';
import {JsonLdObj} from 'jsonld/jsonld-spec';
import Router from 'koa-router';
import cloneDeep from 'lodash.clonedeep';

interface CreateArticleRouteContext extends Koa.Context {
    request: Request & {
        body: object,
    },
}

export default (client: AxiosInstance, router: Router): Koa.Middleware => {
    return async ({request, response}: CreateArticleRouteContext): Promise<void> => {
        const action = <JsonLdObj>(await jsonld.expand(JSON.parse(request.body.action)))[0];
        const fields = <{ [key: string]: string }>request.body.fields;

        let newAction = cloneDeep(action);
        delete newAction['http://schema.org/target'];

        let result = <JsonLdObj>newAction['http://schema.org/result'][0];

        Object.keys(result).forEach((key: string): void => {
            const match = key.match(/^(?<property>http:\/\/schema\.org\/(?<name>.+?))-input$/);

            if (!match || !(match.groups)) {
                return;
            }

            delete result[key];

            if (match.groups.name in fields) {
                result[match.groups.property] = fields[match.groups.name];
            }
        });

        newAction['http://schema.org/result'] = result;

        const target = action['http://schema.org/target'][0];

        await client({
            method: target['http://schema.org/httpMethod'][0]['@value'],
            url: target['http://schema.org/urlTemplate'][0]['@value'],
            data: newAction,
        });

        response.status = constants.HTTP_STATUS_SEE_OTHER;
        response.redirect(router.url('homepage', {}));
    }
};
