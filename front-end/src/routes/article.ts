import Koa from 'koa';
import {constants} from 'http2';
import {AxiosError, AxiosInstance} from 'axios';
import jsonld from 'jsonld';
import {JsonLdArray, JsonLdObj} from 'jsonld/jsonld-spec';
import atob from 'atob';
import Router from 'koa-router';

interface ArticleRouteContext extends Koa.Context {
    params: {
        id: string,
    },
}

function isAxiosError(arg: any): arg is AxiosError {
    return arg.isAxiosError;
}

export default (client: AxiosInstance, router: Router): Koa.Middleware => {
    const fetch = async (uri: string, type: string): Promise<JsonLdObj> => {
        const listResponse = await client.get(uri);
        const expanded = <JsonLdArray>await jsonld.expand(listResponse.data);
        const object = <JsonLdObj>expanded[0];

        if (!(object['@type'].includes(type))) {
            throw new Error(`Not a ${type}`);
        }

        return object;
    };

    return async ({response, params: {id}}: ArticleRouteContext): Promise<void> => {
        let article: JsonLdObj;

        try {
            article = await fetch(atob(id), 'http://schema.org/Article');
        } catch (error) {
            if (isAxiosError(error) && error.response && error.response.status === constants.HTTP_STATUS_NOT_FOUND) {
                response.status = constants.HTTP_STATUS_NOT_FOUND;
                return;
            }

            throw error;
        }

        response.status = constants.HTTP_STATUS_OK;
        response.type = 'html';

        let body: string = '<html><body>';

        body += `<a href="${router.url('homepage', {})}">Home</a>`;

        body += `<h1>${article['http://schema.org/name'][0]['@value'] || 'Unknown article'}</h1>`;

        body += '</body></html>';

        response.body = body;
    }
};
