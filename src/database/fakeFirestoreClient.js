function clone(value) {
  return structuredClone(value);
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function createId(collectionName) {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${collectionName}-${Date.now()}-${randomPart}`;
}

export function createFakeFirestoreClient({ jsonPath, latencyMs }) {
  let databaseCache = null;

  async function loadDatabase() {
    if (databaseCache) {
      return databaseCache;
    }

    await wait(latencyMs.get);

    const response = await fetch(jsonPath, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Nao foi possivel carregar ${jsonPath}.`);
    }

    databaseCache = await response.json();
    return databaseCache;
  }

  async function getCollection(collectionName) {
    const database = await loadDatabase();
    const collection = database[collectionName];
    return clone(Array.isArray(collection) ? collection : []);
  }

  async function postDocument(collectionName, document) {
    const database = await loadDatabase();
    await wait(latencyMs.post);

    const newDocument = {
      ...document,
      id: document.id || createId(collectionName),
      criadoEm: document.criadoEm || new Date().toISOString()
    };

    if (!Array.isArray(database[collectionName])) {
      database[collectionName] = [];
    }

    database[collectionName].push(newDocument);
    return clone(newDocument);
  }

  async function deleteDocument(collectionName, documentId) {
    const database = await loadDatabase();
    await wait(latencyMs.delete);

    const collection = Array.isArray(database[collectionName]) ? database[collectionName] : [];
    const beforeLength = collection.length;
    database[collectionName] = collection.filter((document) => document.id !== documentId);

    return {
      id: documentId,
      deleted: database[collectionName].length !== beforeLength
    };
  }

  return {
    getCollection,
    postDocument,
    deleteDocument
  };
}
