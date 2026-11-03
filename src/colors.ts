import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_FIREBASE } from '../config';
import { Backend } from './types';
import { createMockBackend } from './mockBackend';
import { createFirebaseBackend } from './firebaseBackend';

/** The single backend instance used by the whole app. */
export const backend: Backend = USE_FIREBASE
  ? createFirebaseBackend()
  : createMockBackend(AsyncStorage);

export { BackendError } from './types';
