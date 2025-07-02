import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firestore";

export type Usage = {
  id: string;
  userId: string;
  meetingId: string;
  mins: number;
  month: string; // Format: '2025-07'
};

export async function addUsage(usage: Omit<Usage, "id">): Promise<Usage> {
  const docRef = await addDoc(collection(db, "usage"), usage);
  return { id: docRef.id, ...usage };
}

export async function getMonthlyUsage(userId: string, month: string): Promise<Usage[]> {
  const usageRef = collection(db, "usage");
  const q = query(
    usageRef, 
    where("userId", "==", userId),
    where("month", "==", month)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as Usage[];
}

export async function getMonthlyUsageSum(userId: string, month: string): Promise<number> {
  const usageList = await getMonthlyUsage(userId, month);
  return usageList.reduce((sum, usage) => sum + usage.mins, 0);
}

export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}