import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Calendar, Check, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import { getProject, updateProject, type Project, type UpdateProjectData } from '~/services/projects';
import { listTodos, createTodo, updateTodo, deleteTodo, type Todo, type CreateTodoData } from '~/services/todos';
import { listMeetingsByProject, type Meeting } from '~/services/meetings';
import { useAuth } from '~/components/auth';
import { ConfirmationDialog } from '~/components/confirmationDialog';
import { MeetingsTable } from '~/components/MeetingsTable';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editingProject, setEditingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [todoForm, setTodoForm] = useState({ name: '', due_date: '' });
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

  useEffect(() => {
    const loadProjectAndTodos = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        const [projectData, todosData, meetingsData] = await Promise.all([
          getProject(id),
          listTodos(id),
          listMeetingsByProject(id)
        ]);
        
        if (!projectData) {
          setError('Project not found');
          return;
        }
        
        if (projectData.userId !== user.uid) {
          setError('Access denied');
          return;
        }
        
        setProject(projectData);
        setProjectForm({ name: projectData.name, description: projectData.description });
        setTodos(todosData);
        setMeetings(meetingsData);
      } catch (err) {
        setError('Failed to load project');
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProjectAndTodos();
  }, [id, user]);

  const handleUpdateProject = async () => {
    if (!project || !projectForm.name.trim()) return;
    
    try {
      const updates: UpdateProjectData = {};
      if (projectForm.name !== project.name) updates.name = projectForm.name.trim();
      if (projectForm.description !== project.description) updates.description = projectForm.description.trim();
      
      if (Object.keys(updates).length > 0) {
        await updateProject(project.id, updates);
        setProject({ ...project, ...updates });
      }
      setEditingProject(false);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handleAddTodo = async () => {
    if (!project || !todoForm.name.trim()) return;
    
    try {
      const todoData: CreateTodoData = {
        name: todoForm.name.trim(),
        due_date: todoForm.due_date ? new Date(todoForm.due_date) : null,
      };
      
      await createTodo(project.id, todoData);
      const updatedTodos = await listTodos(project.id);
      setTodos(updatedTodos);
      setTodoForm({ name: '', due_date: '' });
      setShowAddTodo(false);
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      await updateTodo(project!.id, todo.id, { completed: !todo.completed });
      const updatedTodos = await listTodos(project!.id);
      setTodos(updatedTodos);
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const handleDeleteTodo = async () => {
    if (!todoToDelete) return;
    
    try {
      await deleteTodo(project!.id, todoToDelete.id);
      const updatedTodos = await listTodos(project!.id);
      setTodos(updatedTodos);
      setTodoToDelete(null);
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Project Info */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {editingProject ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      placeholder="Project name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                      id="project-description"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Project description"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProject} size="sm">
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingProject(false);
                        setProjectForm({ name: project.name, description: project.description });
                      }} 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {project.description || 'No description provided'}
                  </CardDescription>
                </>
              )}
            </div>
            {!editingProject && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingProject(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Created {new Date(project.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Todos Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Todos</CardTitle>
            <Button onClick={() => setShowAddTodo(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Todo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddTodo && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="todo-name">Todo Name</Label>
                  <Input
                    id="todo-name"
                    value={todoForm.name}
                    onChange={(e) => setTodoForm({ ...todoForm, name: e.target.value })}
                    placeholder="Enter todo name"
                  />
                </div>
                <div>
                  <Label htmlFor="todo-due-date">Due Date (Optional)</Label>
                  <Input
                    id="todo-due-date"
                    type="datetime-local"
                    value={todoForm.due_date}
                    onChange={(e) => setTodoForm({ ...todoForm, due_date: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTodo} size="sm">
                    Add Todo
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddTodo(false);
                      setTodoForm({ name: '', due_date: '' });
                    }} 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {todos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No todos yet</p>
              <p className="text-sm text-muted-foreground">Add your first todo to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={`flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm ${
                    todo.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleTodo(todo)}
                      className="p-1 h-6 w-6 rounded-full"
                    >
                      {todo.completed ? (
                        <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </Button>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium text-gray-900 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                        {todo.name}
                      </h3>
                      {todo.due_date && (
                        <p className="text-sm text-gray-500 mt-1">
                          {todo.due_date.toDate().toLocaleDateString()} • {todo.due_date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTodoToDelete(todo)}
                    className="p-1 h-8 w-8 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meetings Section */}
      <div className="mt-8">
        <MeetingsTable meetings={meetings} showActions={false} />
      </div>

      <ConfirmationDialog
        open={!!todoToDelete}
        onOpenChange={(open) => !open && setTodoToDelete(null)}
        onConfirm={handleDeleteTodo}
        title="Delete Todo"
        description={`Are you sure you want to delete "${todoToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}