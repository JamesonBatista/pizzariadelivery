import { firestoreConfig, hasFirestoreCredentials } from "../config/firestoreConfig.js";

export function createFirestoreConnection(config = firestoreConfig) {
  if (!hasFirestoreCredentials(config)) {
    throw new Error("Firestore ainda nao configurado. Envie os dados de conexao para ativar.");
  }

  /*
   * Este ponto fica isolado para receber a inicializacao real do Firebase/Firestore
   * sem espalhar credenciais ou imports de SDK pela interface.
   */
  return {
    type: "firestore",
    config
  };
}
