import {Iri, JsonLdObj} from "jsonld/jsonld-spec";

export interface Nodes {
    all(): Iterable<JsonLdObj>;

    add(node: JsonLdObj): Promise<void>;

    get(id: Iri): Promise<JsonLdObj>;

    has(id: Iri): Promise<boolean>;
}

export class InMemoryNodes implements Nodes {
    private nodes: { [key: string]: JsonLdObj } = {};

    all(): Iterable<JsonLdObj> {
        return Object.values(this.nodes);
    }

    async add(node: JsonLdObj): Promise<void> {
        this.nodes[node['@id']] = node;
    }

    async get(id: Iri): Promise<JsonLdObj> {
        return this.nodes[id];
    }

    async has(id: Iri): Promise<boolean> {
        return id in this.nodes;
    }
}
