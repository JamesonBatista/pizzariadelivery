import { appConfig } from "../config/appConfig.js";
import { firestoreConfig } from "../config/firestoreConfig.js";
import { createFakeFirestoreClient } from "../database/fakeFirestoreClient.js";
import { createFirestoreConnection } from "../database/firestoreConnection.js";

function createFirestoreService() {
  const connection = createFirestoreConnection(firestoreConfig);

  return {
    async getCollection() {
      throw new Error(`Conexao ${connection.type} criada, mas o SDK do Firestore ainda nao foi ligado.`);
    },
    async postDocument() {
      throw new Error(`Conexao ${connection.type} criada, mas o SDK do Firestore ainda nao foi ligado.`);
    },
    async updateDocument() {
      throw new Error(`Conexao ${connection.type} criada, mas o SDK do Firestore ainda nao foi ligado.`);
    },
    async deleteDocument() {
      throw new Error(`Conexao ${connection.type} criada, mas o SDK do Firestore ainda nao foi ligado.`);
    }
  };
}

export function createDatabaseService(config = appConfig) {
  if (config.dataSource.driver === "firestore") {
    return createFirestoreService();
  }

  return createFakeFirestoreClient({
    jsonPath: config.dataSource.jsonPath,
    latencyMs: config.fakeDatabaseLatencyMs
  });
}
