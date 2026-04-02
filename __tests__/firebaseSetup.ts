import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { join } from 'path';

// Firebase emulator configuration
const EMULATOR_CONFIG = {
  projectId: 'silsilah-keluarga-kita-test',
  firestore: {
    port: 4000,
    host: '127.0.0.1'
  }
};

let testEnv: RulesTestEnvironment | null = null;

beforeAll(async () => {
  try {
    // Initialize Firebase test environment with emulator
    testEnv = await initializeTestEnvironment({
      projectId: EMULATOR_CONFIG.projectId,
      firestore: {
        rules: readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8'),
        port: EMULATOR_CONFIG.firestore.port,
        host: EMULATOR_CONFIG.firestore.host
      }
    });
    
    console.log('🔥 Firebase Emulator initialized');
  } catch (error) {
    // If emulator is not running, tests will use mocks
    console.warn('⚠️ Firebase Emulator not available, using mocks:', error);
  }
});

afterAll(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

afterEach(() => {
  cleanup();
  
  // Clear Firestore data between tests
  if (testEnv) {
    testEnv.clearFirestore();
  }
});

// Helper function to get authenticated firestore
export function getAuthenticatedFirestore(auth?: any) {
  if (!testEnv) {
    throw new Error('Firebase test environment not initialized');
  }
  return testEnv.authenticatedContext(auth?.uid || 'test-user').firestore();
}

// Helper function to get unauthenticated firestore
export function getUnauthenticatedFirestore() {
  if (!testEnv) {
    throw new Error('Firebase test environment not initialized');
  }
  return testEnv.unauthenticatedContext().firestore();
}

// Helper to clear all data
export async function clearFirestore() {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
}

// Export testEnv for direct access
export { testEnv };