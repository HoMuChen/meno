import { collection, getDocs, addDoc, updateDoc, doc, getDoc, query, where, deleteDoc, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../firebase/firestore";

export type Meeting = {
  id: string;
  userId: string;
  title: string;
  description: string;
  content: string;
  summary?: string;
  status: string;
  fileUrl?: string;
  created_at: string;
};

export async function listMeetings(userId: string): Promise<Meeting[]> {
  const meetingsRef = collection(db, "meetings");
  const q = query(meetingsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const meetings = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    // Exclude content and summary fields for better performance
    const { content, summary, ...meetingData } = data;
    return {
      id: doc.id,
      ...meetingData,
    };
  }) as Meeting[];
  return meetings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export type PaginatedMeetings = {
  meetings: Meeting[];
  hasMore: boolean;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
};

export async function listMeetingsPaginated(
  userId: string,
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<PaginatedMeetings> {
  const meetingsRef = collection(db, "meetings");
  let q = query(
    meetingsRef,
    where("userId", "==", userId),
    limit(pageSize + 1) // Get one extra to check if there's more
  );

  if (lastDoc) {
    q = query(
      meetingsRef,
      where("userId", "==", userId),
      startAfter(lastDoc),
      limit(pageSize + 1)
    );
  }

  const querySnapshot = await getDocs(q);
  const docs = querySnapshot.docs;
  const hasMore = docs.length > pageSize;
  
  // Sort by created_at desc client-side
  const sortedDocs = docs.sort((a, b) => {
    const aCreated = a.data().created_at;
    const bCreated = b.data().created_at;
    return new Date(bCreated).getTime() - new Date(aCreated).getTime();
  });
  
  const meetings = sortedDocs.slice(0, pageSize).map((doc) => {
    const data = doc.data();
    // Exclude content and summary fields for better performance
    const { content, summary, ...meetingData } = data;
    return {
      id: doc.id,
      content: "", // Provide empty content for list view
      summary: summary || "", // Provide empty summary or existing value
      ...meetingData,
    };
  }) as Meeting[];

  return {
    meetings,
    hasMore,
    lastDoc: hasMore ? sortedDocs[pageSize - 1] : undefined,
  };
}

export async function addMeeting(meeting: Omit<Meeting, "id">): Promise<Meeting> {
  const docRef = await addDoc(collection(db, "meetings"), meeting);
  return { id: docRef.id, ...meeting };
}

export async function updateMeeting(id: string, meeting: Partial<Meeting>): Promise<void> {
  const meetingRef = doc(db, "meetings", id);
  await updateDoc(meetingRef, meeting);
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  const meetingRef = doc(db, "meetings", id);
  const docSnap = await getDoc(meetingRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Meeting;
}

export async function deleteMeeting(id: string): Promise<void> {
  const meetingRef = doc(db, "meetings", id);
  await deleteDoc(meetingRef);
} 
