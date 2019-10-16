import Koa from 'koa';
import {constants} from 'http2';
import jsonld from 'jsonld';
import {Document} from 'jsonld/jsonld-spec';
import Router from "koa-router";

export default (router: Router): Koa.Middleware => {
    return async ({response}: Koa.Context): Promise<void> => {
        const createActionRoute = router.route('create-action');
        const listRoute = router.route('list');
        const searchRoute = router.route('search');

        // This should make request to each individual API and aggregate the possible actions.
        // They will need their own WebAPI containing potentialAction (even if there's just one).
        const list: Document = {
            '@type': 'http://schema.org/WebAPI',
            'http://schema.org/potentialAction': [
                {
                    '@type': 'http://schema.org/DiscoverAction', // Not sure what a sensible 'ListAction' should be?
                    'http://schema.org/target': listRoute.url({}),
                    'http://scheam.org/object': {
                        '@type': 'http://schema.org/Article',
                    },
                },
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
            ],
        };

        response.status = constants.HTTP_STATUS_OK;
        response.body = await jsonld.compact(list, {});
        response.type = 'application/ld+json';
    };
};
