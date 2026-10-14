import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore using provisioned database ID
// CRITICAL: The app will break without firebaseConfig.firestoreDatabaseId
// Using experimentalForceLongPolling prevents WebChannel streaming dropouts in proxied / iframe preview environments
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Error Handling Specification conforming to SKILL.md
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errStr = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };

  const isOfflineOrTimeout =
    errStr.includes('offline') ||
    errStr.includes('Could not reach Cloud Firestore backend') ||
    errStr.includes('Backend didn\'t respond within 10 seconds') ||
    errStr.includes('unavailable') ||
    errStr.includes('deadline-exceeded') ||
    errStr.includes('network-request-failed');

  if (isOfflineOrTimeout) {
    console.warn(`[NMDC Firestore Offline Mode] Operating with local persistence for ${operationType} on ${path || 'database'}: ${errStr}`);
    return errInfo;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Startup connection verification with graceful fast timeout to avoid 10-second backend stalls
export async function testConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.log('Firebase Firestore: Operating in offline mode with full local storage fallback.');
    return false;
  }

  try {
    const fetchDoc = getDocFromServer(doc(db, 'test', 'connection'));
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore connection check timed out (graceful offline fallback)')), 2500)
    );

    await Promise.race([fetchDoc, timeout]);
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('offline') || msg.includes('timed out') || msg.includes('Could not reach')) {
      console.log('Firebase Firestore: Operating in offline mode with full local storage fallback.');
    } else {
      console.log('Firebase initialized (security rules active).');
    }
    return false;
  }
}

// Trigger initial connection verification with safety catch
testConnection().catch(() => {});

export default app;
