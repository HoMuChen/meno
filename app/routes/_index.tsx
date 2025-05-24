import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { PlusIcon, MicrophoneIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";
import { AudioRecorderModal } from "../components/audioRecorderModal";
import { FileUploadModal } from "../components/fileUploadModal";
import { addMeeting } from "../services/meetings";
import { useAuth } from "../components/auth";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleRecordClick = () => setIsRecordModalOpen(true);
  const handleUploadClick = () => setIsUploadModalOpen(true);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to Meno
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <PlusIcon className="h-5 w-5" />
                New Meeting
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRecordClick}>
                <MicrophoneIcon className="h-4 w-4 mr-2" /> Record
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleUploadClick}>
                <ArrowUpTrayIcon className="h-4 w-4 mr-2" /> Upload file
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
      </div>
      <AudioRecorderModal
        open={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onUploadSuccess={async (url: string) => {
          await addMeeting({
            userId: user?.uid || "",
            title: "Audio Meeting",
            description: "Recorded audio meeting",
            content: "",
            summary: "",
            status: "in progress",
            fileUrl: url,
            created_at: new Date().toISOString(),
          });
          setIsRecordModalOpen(false);
          navigate("/meetings");
        }}
      />
      <FileUploadModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={async (url: string) => {
          await addMeeting({
            userId: user?.uid || "",
            title: "Uploaded File Meeting",
            description: "Meeting with uploaded file",
            content: "",
            status: "in progress",
            fileUrl: url,
            created_at: new Date().toISOString(),
          });
          setIsUploadModalOpen(false);
          navigate("/meetings");
        }}
      />
    </div>
  );
}
