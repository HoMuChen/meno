import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/storage";

export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
} 