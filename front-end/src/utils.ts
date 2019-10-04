import {Iri, JsonLdArray, JsonLdObj} from 'jsonld/jsonld-spec';
import {AxiosInstance} from 'axios';
import jsonld from 'jsonld';

export const fetch = async (client: AxiosInstance, uri: string, type: string): Promise<JsonLdObj> => {
    const listResponse = await client.get(uri);
    const expanded = <JsonLdArray>await jsonld.expand(listResponse.data);
    const object = <JsonLdObj>expanded[0];

    if (!(object['@type'].includes(type))) {
        throw new Error(`Not a ${type}`);
    }

    return object;
};

export const findPotentialAction = (thing: JsonLdObj, action: Iri, type?: Iri): JsonLdObj | null => {
    const potentialActions: Array<JsonLdObj> = thing['http://schema.org/potentialAction'] || [];

    for (const potentialAction of potentialActions) {
        if (!(potentialAction['@type'].includes(action))) {
            continue;
        }

        if (type) {
            if (!(potentialAction['http://schema.org/result']) || !(potentialAction['http://schema.org/result'][0]['@type'])) {
                continue;
            }

            if (!(potentialAction['http://schema.org/result'][0]['@type'].includes(type))) {
                continue;
            }
        }

        return potentialAction;
    }

    return null;
};
