import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firestore";

export type Todo = {
  id: string;
  projectId: string;
  name: string;
  due_date: Timestamp | null;
  completed: boolean;
  created_at: string;
};

export type CreateTodoData = {
  name: string;
  due_date: Date | null;
};

export type UpdateTodoData = {
  name?: string;
  due_date?: Date | null;
  completed?: boolean;
};

export async function listTodos(projectId: string): Promise<Todo[]> {
  const todosRef = collection(db, "projects", projectId, "todos");
  const q = query(todosRef, orderBy("due_date", "asc"));
  const querySnapshot = await getDocs(q);
  const todos = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    projectId,
    ...doc.data(),
  })) as Todo[];
  return todos;
}

export async function createTodo(projectId: string, todoData: CreateTodoData): Promise<string> {
  const todosRef = collection(db, "projects", projectId, "todos");
  const todo = {
    name: todoData.name,
    due_date: todoData.due_date ? Timestamp.fromDate(todoData.due_date) : null,
    completed: false,
    created_at: new Date().toISOString(),
  };
  const docRef = await addDoc(todosRef, todo);
  return docRef.id;
}

export async function updateTodo(projectId: string, todoId: string, updates: UpdateTodoData): Promise<void> {
  const todoRef = doc(db, "projects", projectId, "todos", todoId);
  const updateData: any = {};
  
  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }
  if (updates.due_date !== undefined) {
    updateData.due_date = updates.due_date ? Timestamp.fromDate(updates.due_date) : null;
  }
  if (updates.completed !== undefined) {
    updateData.completed = updates.completed;
  }
  
  await updateDoc(todoRef, updateData);
}

export async function deleteTodo(projectId: string, todoId: string): Promise<void> {
  const todoRef = doc(db, "projects", projectId, "todos", todoId);
  await deleteDoc(todoRef);
}
