import {Iri, JsonLdObj} from 'jsonld/jsonld-spec';
import jsonfile from 'jsonfile';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import uniqueString from 'unique-string';

export interface Nodes {
    all(): Iterable<JsonLdObj>;

    add(node: JsonLdObj): Promise<void>;

    get(id: Iri): Promise<JsonLdObj>;

    has(id: Iri): Promise<boolean>;
}

type IdGenerator = (id: string) => Iri;

const sha256 = (string: string) => crypto.createHash('sha256').update(string, 'utf8').digest('hex');

export class FileNodes implements Nodes {
    private readonly dir: string;
    private readonly idGenerator: IdGenerator;

    constructor(dir: string, idGenerator: IdGenerator) {
        this.dir = dir;
        this.idGenerator = idGenerator;
    }

    * all(): Iterable<JsonLdObj> {
        const files = fs.readdirSync(this.dir).filter(file => file.endsWith('.json'));

        for (const file of files) {
            yield jsonfile.readFileSync(path.resolve(this.dir, file));
        }
    }

    async add(node: JsonLdObj): Promise<void> {
        if (!(node['@type'])) {
            throw new Error('Not a node object');
        }

        if (!(node['@id'])) {
            node['@id'] = this.idGenerator(uniqueString());
        }

        await jsonfile.writeFile(this.filePath(node['@id']), node, {spaces: 2});
    }

    async get(id: Iri): Promise<JsonLdObj> {
        return jsonfile.readFile(this.filePath(id));
    }

    async has(id: Iri): Promise<boolean> {
        try {
            await this.get(id);
        } catch {
            return false;
        }

        return true;
    }

    private filePath(id: Iri): string {
        return path.resolve(this.dir, `${sha256(id)}.json`);
    }
}
