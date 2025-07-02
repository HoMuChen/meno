import { useState } from "react";
import { useAuth } from "../components/auth";
import { useNavigate } from "react-router-dom";
import { addMeeting } from "../services/meetings";
import { PlusIcon, MicrophoneIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { AudioRecorderModal } from "../components/audioRecorderModal";
import { FileUploadModal } from "../components/fileUploadModal";

export default function IndexPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleAddMeeting = async (url: string) => {
    if (!user) return;
    const newMeeting = await addMeeting({
      userId: user.uid,
      title: "Meeting",
      description: "Meeting added from audio or file",
      content: "",
      summary: "",
      status: "in progress",
      fileUrl: url,
      created_at: new Date().toISOString(),
    });
    if (newMeeting) {
      navigate(`/meetings/${newMeeting.id}`);
    }
  };

  const handleRecordClick = () => {
    setIsRecordModalOpen(true);
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Meno</h1>
          <p className="text-muted-foreground">Please log in to start creating meetings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome to Meno</h1>
        <p className="text-muted-foreground mb-8">Start by creating your first meeting</p>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" className="px-8 py-4 text-lg">
              <PlusIcon className="h-6 w-6 mr-3" />
              Create Meeting
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuItem onClick={handleRecordClick}>
              <MicrophoneIcon className="h-4 w-4 mr-2" /> Record Audio
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUploadClick}>
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" /> Upload File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AudioRecorderModal
        open={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onUploadSuccess={async (url: string) => {
          await handleAddMeeting(url);
          setIsRecordModalOpen(false);
        }}
      />

      <FileUploadModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        accept="audio/*"
        onUploadSuccess={async (url: string) => {
          await handleAddMeeting(url);
          setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
}