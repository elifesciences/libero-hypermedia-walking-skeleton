import Koa from 'koa';
import {constants} from 'http2';
import jsonld from 'jsonld';
import {Document, JsonLdObj} from 'jsonld/jsonld-spec';
import {Nodes} from "../nodes";
import Router from "koa-router";

interface ListRouteContext extends Koa.Context {
}

export default (articles: Nodes, router: Router): Koa.Middleware => {
    return async ({response}: ListRouteContext): Promise<void> => {
        const createActionRoute = router.route('create-action');
        const searchRoute = router.route('search');
        const registerRoute = router.route('register');

        const list: Document = {
            '@type': 'http://schema.org/Collection',
            'http://schema.org/name': 'List of articles',
            'http://schema.org/hasPart': [...articles.all()].map((object: JsonLdObj): string => object['@id']),
            'http://schema.org/potentialAction': [
                {
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
                },
                {
                    '@type': 'http://schema.org/SearchAction',
                    'http://schema.org/target': searchRoute.url({query: {keyword: 'PLACEHOLDER'}}).replace('PLACEHOLDER', '{keyword}'),
                    'http://schema.org/query-input': {
                        '@type': 'http://schema.org/PropertyValueSpecification',
                        'http://schema.org/valueRequired': true,
                        'http://schema.org/valueName': 'keyword',
                    },
                },
                /*
                 * curl -v -X POST -H "Content-Type: application/ld+json" http://localhost:8081/register -d '{"@type": "http://schema.org/RegisterAction", "http://schema.org/agent": {"@type":"http://schema.org/Person", "http://schema.org/givenName":"Giorgio"}}'
                */
                {
                    "@type": "http://schema.org/RegisterAction",
                    'http://schema.org/target': {
                        'http://schema.org/httpMethod': registerRoute.methods,
                        'http://schema.org/urlTemplate': registerRoute.url({}),
                        'http://schema.org/encodingType': 'application/ld+json',
                    },
                    'http://schema.org/agent-input': {
                        '@type': 'http://schema.org/PropertyValueSpecification',

                        'http://schema.org/valueRequired': true,
                    }
                }
            ],
        };

        response.status = constants.HTTP_STATUS_OK;
        response.body = await jsonld.compact(list, {});
        response.type = 'application/ld+json';
    };
};
