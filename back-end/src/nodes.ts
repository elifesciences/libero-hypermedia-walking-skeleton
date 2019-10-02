import {Iri, JsonLdObj} from 'jsonld/jsonld-spec';
import * as jsonfile from 'jsonfile';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface Nodes {
    all(): Iterable<JsonLdObj>;

    add(node: JsonLdObj): Promise<void>;

    get(id: Iri): Promise<JsonLdObj>;

    has(id: Iri): Promise<boolean>;
}

const sha256 = (string: string) => crypto.createHash('sha256').update(string, 'utf8').digest('hex');
const ensureDir = (path: string) => fs.mkdirSync(path, {recursive: true});

export class FileNodes implements Nodes {
    private readonly dir: string;

    constructor(dir: string) {
        this.dir = dir;
    }

    * all(): Iterable<JsonLdObj> {
        ensureDir(this.dir);
        const files = fs.readdirSync(this.dir);

        for (const file of files) {
            yield jsonfile.readFileSync(path.resolve(this.dir, file));
        }
    }

    async add(node: JsonLdObj): Promise<void> {
        ensureDir(this.dir);
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
