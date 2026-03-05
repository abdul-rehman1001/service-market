import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/firebaseAdmin';

/**
 * Diagnose Firebase Admin SDK IAM and API access
 * GET /api/chat/diagnose
 */
export async function GET(req: NextRequest) {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
  };

  try {
    // Get app info
    const app = admin.app();
    diagnostics.app = {
      projectId: app.options.projectId,
    };

    // Get Firestore instance
    const db = admin.firestore();
    diagnostics.firestore = {
      initialized: !!db,
    };

    // Try different approaches
    diagnostics.tests = {};

    // Test 1: Direct collection access
    try {
      const collections = await db.listCollections();
      diagnostics.tests.listCollections = {
        status: 'OK',
        count: collections.length,
        names: collections.map((c: FirebaseFirestore.CollectionReference) => c.id),
      };
    } catch (err: any) {
      diagnostics.tests.listCollections = {
        status: 'FAIL',
        error: err.message,
        code: err.code,
      };
    }

    // Test 2: Read from conversations
    try {
      const snapshot = await db.collection('conversations').limit(1).get();
      diagnostics.tests.readConversations = {
        status: 'OK',
        count: snapshot.size,
      };
    } catch (err: any) {
      diagnostics.tests.readConversations = {
        status: 'FAIL',
        error: err.message,
        code: err.code,
        details: err.details,
      };
    }

    // Test 3: Write to conversations
    try {
      const testRef = db.collection('conversations').doc('_test_' + Date.now());
      await testRef.set({ test: true, timestamp: new Date().toISOString() });
      await testRef.delete();
      diagnostics.tests.writeConversations = {
        status: 'OK',
      };
    } catch (err: any) {
      diagnostics.tests.writeConversations = {
        status: 'FAIL',
        error: err.message,
        code: err.code,
        details: err.details,
      };
    }

    // Determine overall health
    const failedTests = Object.entries(diagnostics.tests)
      .filter(([, v]) => (v as any).status === 'FAIL')
      .map(([k]) => k);

    diagnostics.overallStatus = failedTests.length === 0 ? 'HEALTHY' : 'UNHEALTHY';
    diagnostics.solution = failedTests.length > 0
      ? 'Visit Firebase Console > Project Settings > Service Accounts. Ensure the service account has "Editor" or "Firebase Admin" role in IAM.'
      : 'All tests passed! Chat is ready.';

    const statusCode = failedTests.length === 0 ? 200 : 500;
    return NextResponse.json(diagnostics, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error.message,
        diagnostic: diagnostics,
      },
      { status: 500 }
    );
  }
}
