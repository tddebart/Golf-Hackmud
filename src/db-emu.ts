import { Collection, MongoClient } from "mongodb";

let client: MongoClient;
let collection: Collection;
let localData: object[];

export async function startDb() {
    await startDBConnection();

    // @ts-ignore
    // hackmud database emulating
    // we use localData to store data without needing to do async calls to the database
    global.$db = {
        i: insert,
        f: find,
        u: update,
        us: us,
        r: remove,
    };
}

function insert(document: MongoDocument) {
    // check if document is already in localData with _id
    if (localData.find((d: any) => d._id === document._id) === undefined) {
        localData.push(document);
    } else {
        console.error("Document already exists in localData with _id: " + document._id);
    }
}

function remove(query: Query) {
    let items = find(query).array();
    for (const item of items) {
        let index = localData.indexOf(item);
        delete localData[index];
    }
}


function find(query: any): {first: () => any|null, array: () => any[], count: () => number} {
    let results = localData.filter((d: any) => {
        for (let key in query) {
            if (query[key] !== d[key]) {
                return false;
            }
        }
        return true;
    });

    return {
        first: () => results[0] || null,
        array: () => results,
        count: () => results.length
    }
}

function update(query: any, update: MongoCommand) {
    let items = find(query).array();
    if (items.length == 0) {
        console.error("Document does not exist in localData with _id: " + query._id);
    }

    for (const item of items) {
        if (update.$set) {
            for (const key in update.$set) {
                item[key] = update.$set[key];
            }
        } else if (update.$unset) {
            for (const key in update.$unset) {
                delete item[key];
            }
        } else if (update.$push) {
            for (const key in update.$push) {
                if (!Array.isArray(item[key])) {
                    console.error("Cannot push to non-array item with key: " + key);
                }
                item[key].push(update.$push[key]);
            }
        }
    }
}

function us(query: Query, updateCommand: MongoCommand) {
    let exists = find(query).first() != null;

    if (exists) {
        update(query, updateCommand);
    } else {

        //TODO: fix this so it creates it right see https://wiki.hackmud.com/scripting/db/db.us
        let updateObject
        if (updateCommand.$set) {
            updateObject = updateCommand.$set
        }


        insert({ ...query, ...updateObject });
    }
}

async function startDBConnection() {
    const url = "mongodb://localhost:27017";
    client = new MongoClient(url);
    const dbName = "hackmud";

    await client.connect();
    const db = client.db(dbName);
    collection = db.collection("golf");

    localData = await collection.find({}).toArray();
}

export async function closeDb() {
    await collection.deleteMany({});
    if (localData.length > 0) {
        await collection.insertMany(localData);
    }

    client.close();
}