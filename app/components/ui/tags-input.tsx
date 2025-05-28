import React, { useState, KeyboardEvent } from "react";
import { Badge } from "./badge";
import { Input } from "./input";
import { Button } from "./button";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function TagsInput({ 
  tags, 
  onChange, 
  placeholder = "Add tags...", 
  className = "",
  disabled = false 
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 p-2 border rounded-md bg-background min-h-[40px] ${className}`}>
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      {!disabled && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="border-none bg-transparent p-0 h-6 text-sm flex-1 min-w-[120px] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      )}
    </div>
  );
} 