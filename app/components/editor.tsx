import { useState, useEffect } from "react";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  height?: string;
}

const TextEditor = ({ value, onChange, disabled }: TextEditorProps) => {
  const [content, setContent] = useState(value || "");

  useEffect(() => {
    setContent(value || "");
  }, [value]);

  return (
    <textarea
      value={content}
      onChange={(e) => {
        setContent(e.target.value);
        onChange(e.target.value);
      }}
      disabled={disabled}
      className="w-full h-full p-4 text-base text-gray-900 bg-white rounded-md focus:outline-none resize-none"
      placeholder="Start typing..."
    />
  );
};

export default TextEditor; 