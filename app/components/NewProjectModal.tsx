import React, { useState } from "react";
import { createProject, type CreateProjectData } from "../services/projects";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { useAuth } from "./auth";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewProjectModal({ open, onClose, onSuccess }: NewProjectModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim()) return;

    setCreating(true);
    setError(null);

    try {
      await createProject(user.uid, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      
      setFormData({ name: "", description: "" });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to create project");
      console.error("Error creating project:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "" });
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg p-4 md:p-6 w-full max-w-sm md:max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">Create New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-3">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter project name"
              required
              disabled={creating}
            />
          </div>
          
          <div className="grid w-full gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter project description (optional)"
              disabled={creating}
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={creating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !formData.name.trim()}
              className="flex-1"
            >
              {creating ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
