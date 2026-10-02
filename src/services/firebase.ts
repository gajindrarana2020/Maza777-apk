import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

// User's official Firebase project configuration (from google-services.json)
export const firebaseConfig = {
  apiKey: "AIzaSyAawL023BLmEMqEiJZ3l_gKNAPt7kfj9_k",
  authDomain: "maza-777.firebaseapp.com",
  databaseURL: "https://maza-777-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "maza-777",
  storageBucket: "maza-777.firebasestorage.app",
  messagingSenderId: "480585951706",
  appId: "1:480585951706:android:07542c602c0edd26f778e3"
};

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Collection References
export const USERS_COLLECTION = 'users';
export const WITHDRAWALS_COLLECTION = 'withdrawals';

export interface FirebaseUserData {
  id: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  balance: number;
  totalWithdrawn?: number;
  totalWon?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface FirebaseWithdrawalData {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  amount: number;
  type: 'bank' | 'upi';
  accountNumber: string;
  bankName: string;
  ifscCode?: string;
  realName: string;
  upiId?: string;
  status: 'pending' | 'approved' | 'rejected';
  utrNumber?: string;
  adminNote?: string;
  timestamp: number;
  updatedAt?: number;
}

/**
 * 1. Save or Update User in Firebase
 * Storing username, password, email, phone, and wallet balance
 */
export async function syncUserToFirebase(userData: FirebaseUserData): Promise<boolean> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userData.id);
    await setDoc(userRef, {
      ...userData,
      updatedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (error) {
    console.warn('[Firebase] syncUserToFirebase error:', error);
    return false;
  }
}

/**
 * 2. Get User from Firebase by ID
 */
export async function getUserFromFirebase(userId: string): Promise<FirebaseUserData | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as FirebaseUserData;
    }
    return null;
  } catch (error) {
    console.warn('[Firebase] getUserFromFirebase error:', error);
    return null;
  }
}

/**
 * 3. Authenticate User with Firebase (Username/Phone + Password)
 */
export async function authenticateFirebaseUser(identifier: string, pass: string): Promise<FirebaseUserData | null> {
  try {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Query by username or phone or email
    const usersCol = collection(db, USERS_COLLECTION);
    
    // Check by username
    const qUser = query(usersCol, where('username', '==', cleanId));
    const snapUser = await getDocs(qUser);
    if (!snapUser.empty) {
      const data = snapUser.docs[0].data() as FirebaseUserData;
      if (data.password === cleanPass) {
        return data;
      }
    }

    // Check by phone
    const qPhone = query(usersCol, where('phone', '==', cleanId));
    const snapPhone = await getDocs(qPhone);
    if (!snapPhone.empty) {
      const data = snapPhone.docs[0].data() as FirebaseUserData;
      if (data.password === cleanPass) {
        return data;
      }
    }

    // Check by email
    const qEmail = query(usersCol, where('email', '==', cleanId));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      const data = snapEmail.docs[0].data() as FirebaseUserData;
      if (data.password === cleanPass) {
        return data;
      }
    }

    return null;
  } catch (error) {
    console.warn('[Firebase] authenticateFirebaseUser error:', error);
    return null;
  }
}

/**
 * 4. Update Wallet Balance in Firebase
 */
export async function updateFirebaseBalance(userId: string, newBalance: number): Promise<boolean> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      balance: newBalance,
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.warn('[Firebase] updateFirebaseBalance error:', error);
    return false;
  }
}

/**
 * 5. Create Withdrawal Request in Firebase
 */
export async function createFirebaseWithdrawal(withdrawal: FirebaseWithdrawalData): Promise<boolean> {
  try {
    const withRef = doc(db, WITHDRAWALS_COLLECTION, withdrawal.id);
    await setDoc(withRef, {
      ...withdrawal,
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.warn('[Firebase] createFirebaseWithdrawal error:', error);
    return false;
  }
}

/**
 * 6. Get All Withdrawals from Firebase (For Admin Panel)
 */
export async function fetchAllFirebaseWithdrawals(): Promise<FirebaseWithdrawalData[]> {
  try {
    const col = collection(db, WITHDRAWALS_COLLECTION);
    const snap = await getDocs(col);
    const results: FirebaseWithdrawalData[] = [];
    snap.forEach((d) => {
      results.push(d.data() as FirebaseWithdrawalData);
    });
    // Sort newest first
    results.sort((a, b) => b.timestamp - a.timestamp);
    return results;
  } catch (error) {
    console.warn('[Firebase] fetchAllFirebaseWithdrawals error:', error);
    return [];
  }
}

/**
 * 7. Update Withdrawal Status (Admin: Success / Approved or Rejected)
 */
export async function updateFirebaseWithdrawalStatus(
  withdrawalId: string, 
  status: 'approved' | 'rejected', 
  utrNumber?: string, 
  adminNote?: string
): Promise<boolean> {
  try {
    const withRef = doc(db, WITHDRAWALS_COLLECTION, withdrawalId);
    await updateDoc(withRef, {
      status,
      utrNumber: utrNumber || null,
      adminNote: adminNote || (status === 'approved' ? 'Processed successfully' : 'Request rejected'),
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.warn('[Firebase] updateFirebaseWithdrawalStatus error:', error);
    return false;
  }
}
