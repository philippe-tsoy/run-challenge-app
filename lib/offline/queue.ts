import type { PendingRunRecord } from "@/lib/offline/types";

const DB_NAME = "run-app-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-runs";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error("IndexedDB error"));

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "clientOperationId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> {
  return openDatabase().then(
    (db) =>
      new Promise<T | void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = fn(store);

        transaction.oncomplete = () => {
          db.close();
          if (request) {
            resolve(request.result);
          } else {
            resolve();
          }
        };

        transaction.onerror = () => {
          db.close();
          reject(transaction.error ?? new Error("Transaction failed"));
        };
      }),
  );
}

export async function enqueuePendingRun(
  record: PendingRunRecord,
): Promise<void> {
  await runTransaction("readwrite", (store) => store.put(record));
}

export async function listPendingRuns(
  challengeId?: string,
): Promise<PendingRunRecord[]> {
  const records = (await runTransaction<PendingRunRecord[]>(
    "readonly",
    (store) => store.getAll(),
  )) as PendingRunRecord[] | void;

  const all = records ?? [];

  if (!challengeId) {
    return all.sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
  }

  return all
    .filter((record) => record.challengeId === challengeId)
    .sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
}

export async function removePendingRun(
  clientOperationId: string,
): Promise<void> {
  await runTransaction("readwrite", (store) => store.delete(clientOperationId));
}

export async function clearPendingRuns(): Promise<void> {
  await runTransaction("readwrite", (store) => store.clear());
}
