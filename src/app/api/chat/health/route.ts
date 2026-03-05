import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const diagnostics: Record<string, any> = {
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
    } catch (err: any) {
      diagnostics.tests.adminInitialized = {
        status: 'FAIL',
        error: err.message,
      };
      return NextResponse.json(diagnostics, { status: 500 });
    }

    // Test 2: Get Firestore instance
    let db;
    try {
      db = admin.firestore();
      diagnostics.tests.firestoreInstance = {
        status: 'OK',
      };
    } catch (err: any) {
      diagnostics.tests.firestoreInstance = {
        status: 'FAIL',
        error: err.message,
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
    } catch (err: any) {
      diagnostics.tests.firestoreRead = {
        status: 'FAIL',
        error: err.message,
        code: err.code,
        details: err.details,
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
    } catch (err: any) {
      diagnostics.tests.firestoreWrite = {
        status: 'FAIL',
        error: err.message,
        code: err.code,
        details: err.details,
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
    } catch (err: any) {
      diagnostics.tests.firestoreListCollections = {
        status: 'FAIL',
        error: err.message,
        code: err.code,
      };
    }

    // Test 6: Check service account from config
    try {
      const serviceAccount = require('@/lib/firebase-adminsdk.json');
      diagnostics.serviceAccount = {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        hasPrivateKey: !!serviceAccount.private_key,
      };
    } catch (err: any) {
      diagnostics.serviceAccount = {
        status: 'FAIL',
        error: 'Could not load service account JSON',
      };
    }

    // Determine overall status
    const failedTests = Object.entries(diagnostics.tests)
      .filter(([, v]) => (v as any).status === 'FAIL')
      .map(([k]) => k);

    diagnostics.overallStatus = failedTests.length === 0 ? 'HEALTHY' : 'UNHEALTHY';
    diagnostics.failedTests = failedTests;

    const statusCode = failedTests.length === 0 ? 200 : 500;
    return NextResponse.json(diagnostics, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
