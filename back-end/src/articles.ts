import {Iri, JsonLdObj} from "jsonld/jsonld-spec";

export interface Articles {
    all(): Iterable<JsonLdObj>;

    add(article: JsonLdObj): void;

    get(id: Iri): JsonLdObj;

    has(id: Iri): boolean;
}

export class InMemoryArticles implements Articles {
    private articles: { [key: string]: JsonLdObj } = {};

    all(): Iterable<JsonLdObj> {
        return Object.values(this.articles);
    }

    add(article: JsonLdObj): void {
        this.articles[article['@id']] = article;
    }

    get(id: Iri): JsonLdObj {
        return this.articles[id];
    }

    has(id: Iri): boolean {
        return id in this.articles;
    }
}
