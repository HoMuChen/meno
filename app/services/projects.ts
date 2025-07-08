import { collection, getDocs, addDoc, doc, getDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/firestore";

export type Project = {
  id: string;
  userId: string;
  name: string;
  description: string;
  created_at: string;
};

export type CreateProjectData = {
  name: string;
  description: string;
};

export async function listProjects(userId: string): Promise<Project[]> {
  const projectsRef = collection(db, "projects");
  const q = query(
    projectsRef, 
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  const projects = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];

  return projects;
}

export async function createProject(userId: string, projectData: CreateProjectData): Promise<string> {
  const projectsRef = collection(db, "projects");
  const project = {
    userId,
    name: projectData.name,
    description: projectData.description,
    created_at: new Date().toISOString(),
  };
  const docRef = await addDoc(projectsRef, project);
  return docRef.id;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const projectRef = doc(db, "projects", projectId);
  const projectSnap = await getDoc(projectRef);
  
  if (projectSnap.exists()) {
    return {
      id: projectSnap.id,
      ...projectSnap.data(),
    } as Project;
  }
  
  return null;
}
