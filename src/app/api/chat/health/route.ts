import { NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';

type HealthTestResult = {
  status: 'OK' | 'FAIL';
  [key: string]: unknown;
};

type HealthDiagnostics = {
  timestamp: string;
  tests: Record<string, HealthTestResult>;
  serviceAccount?: {
    source: 'environment-variables';
    projectId: string | null;
    clientEmail: string | null;
    hasPrivateKey: boolean;
  };
  overallStatus?: 'HEALTHY' | 'UNHEALTHY';
  failedTests?: string[];
};

function getErrorDetails(error: unknown): {
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
} {
  if (error instanceof Error) {
    const possibleError = error as Error & { code?: string; details?: unknown };
    return {
      message: error.message,
      code: possibleError.code,
      details: possibleError.details,
      stack: error.stack,
    };
  }

  return {
    message: 'Unknown error',
    details: error,
  };
}

export async function GET() {
  try {
    const diagnostics: HealthDiagnostics = {
      timestamp: new Date().toISOString(),
      tests: {},
    };

    // Test 1: Check if Firebase Admin is initialized
    try {
      const app = admin.app();
      diagnostics.tests.adminInitialized = {
        status: 'OK',
        projectId: app.options.projectId,
      };
    } catch (err: unknown) {
      const errorDetails = getErrorDetails(err);
      diagnostics.tests.adminInitialized = {
        status: 'FAIL',
        error: errorDetails.message,
      };
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // Test 2: Get Firestore instance
    let db: FirebaseFirestore.Firestore;
    try {
      db = admin.firestore();
      diagnostics.tests.firestoreInstance = {
        status: 'OK',
      };
    } catch (err: unknown) {
      const errorDetails = getErrorDetails(err);
      diagnostics.tests.firestoreInstance = {
        status: 'FAIL',
        error: errorDetails.message,
      };
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // Test 3: Try to read a test document
    try {
      const testDocRef = db.collection('_test').doc('connectivity');
      const doc = await testDocRef.get();
      diagnostics.tests.firestoreRead = {
        status: 'OK',
        docExists: doc.exists,
      };
    } catch (err: unknown) {
      const errorDetails = getErrorDetails(err);
      diagnostics.tests.firestoreRead = {
        status: 'FAIL',
        error: errorDetails.message,
        code: errorDetails.code,
        details: errorDetails.details,
      };
    }

    // Test 4: Try to write a test document
    try {
      const testDocRef = db.collection('_test').doc('connectivity');
      await testDocRef.set(
        {
          testData: 'health-check',
          timestamp: new Date().toISOString(),
        },
        { merge: true }
      );
      diagnostics.tests.firestoreWrite = {
        status: 'OK',
      };
    } catch (err: unknown) {
      const errorDetails = getErrorDetails(err);
      diagnostics.tests.firestoreWrite = {
        status: 'FAIL',
        error: errorDetails.message,
        code: errorDetails.code,
        details: errorDetails.details,
      };
    }

    // Test 5: Try to list collections
    try {
      const collections = await db.listCollections();
      diagnostics.tests.firestoreListCollections = {
        status: 'OK',
        collectionsFound: collections.length,
        collections: collections.map((c: FirebaseFirestore.CollectionReference) => c.id),
      };
    } catch (err: unknown) {
      const errorDetails = getErrorDetails(err);
      diagnostics.tests.firestoreListCollections = {
        status: 'FAIL',
        error: errorDetails.message,
        code: errorDetails.code,
      };
    }

    // Test 6: Check required Firebase env config
    diagnostics.serviceAccount = {
      source: 'environment-variables',
      projectId: process.env.FIREBASE_PROJECT_ID || null,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || null,
      hasPrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
    };

    // Determine overall status
    const failedTests = Object.entries(diagnostics.tests)
      .filter(([, test]) => test.status === 'FAIL')
      .map(([k]) => k);

    diagnostics.overallStatus = failedTests.length === 0 ? 'HEALTHY' : 'UNHEALTHY';
    diagnostics.failedTests = failedTests;

    const statusCode = failedTests.length === 0 ? 200 : 500;
    return NextResponse.json(diagnostics, { status: statusCode });
  } catch (error: unknown) {
    const errorDetails = getErrorDetails(error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: errorDetails.message,
        stack: errorDetails.stack,
      },
      { status: 500 }
    );
  }
}
