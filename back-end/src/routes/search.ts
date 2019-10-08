import Koa, {Request} from 'koa';
import {constants} from 'http2';
import jsonld from 'jsonld';
import {Document, JsonLdObj} from 'jsonld/jsonld-spec';
import {Nodes} from '../nodes';
import Router from 'koa-router';

interface SearchRouteContext extends Koa.Context {
    request: Request & {
        query: {
            keyword: string,
        },
    },
}

export default (articles: Nodes, router: Router): Koa.Middleware => {
    return async ({request, response}: SearchRouteContext): Promise<void> => {
        const keyword: string = request.query.keyword || '';
        const searchRoute = router.route('search');

        const results = [...articles.all()].filter((article: JsonLdObj): boolean => article['http://schema.org/name'][0]['@value'].includes(keyword));

        const list: Document = {
            '@type': 'http://schema.org/ItemList',
            'http://schema.org/name': 'Search results',
            'http://schema.org/itemListElement': results.map((object: JsonLdObj): string => object['@id']),
            'http://schema.org/potentialAction': [
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
