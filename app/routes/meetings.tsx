import { useState, useEffect } from "react";
import { Meeting, listMeetings, addMeeting, updateMeeting, deleteMeeting } from "../services/meetings";
import { useAuth } from "../components/auth";
import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { PlusIcon, PencilIcon, MicrophoneIcon, ArrowUpTrayIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import { Button } from "../components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { AudioRecorderModal } from "../components/audioRecorderModal";
import { FileUploadModal } from "../components/fileUploadModal";
import { MeetingStatusChip } from "../components/meetingStatusChip";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { TagsInput } from "../components/ui/tags-input";

export const meta: MetaFunction = () => [{ title: "Meetings | Meno" }];

export default function MeetingsRoute() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user]);

  const loadMeetings = async () => {
    if (!user) return;
    try {
      const meetingsList = await listMeetings(user.uid);
      setMeetings(meetingsList);
    } catch (error) {
      console.error("Error loading meetings:", error);
    }
  };

  const startEdit = (meeting: Meeting) => {
    setEditingId(meeting.id);
    setEditTitle(meeting.title);
    setEditDescription(meeting.description);
    setEditTags(meeting.tags || []);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditTags([]);
  };

  const saveEdit = async (id: string) => {
    await updateMeeting(id, { 
      title: editTitle, 
      description: editDescription,
      tags: editTags 
    });
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditTags([]);
    loadMeetings();
  };

  const confirmDelete = async (id: string) => {
    await deleteMeeting(id);
    setDeletingId(null);
    loadMeetings();
  };

  const handleRecordClick = () => {
    setIsRecordModalOpen(true);
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  if (!user) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Meetings</h1>
        <p className="text-gray-600">Please log in to view and manage your meetings.</p>
      </div>
    );
  }

  const renderMobileCard = (meeting: Meeting) => (
    <Card key={meeting.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {editingId === meeting.id ? (
              <div className="space-y-2">
                <Input 
                  value={editTitle} 
                  onChange={e => setEditTitle(e.target.value)} 
                  placeholder="Meeting title"
                />
                <Input 
                  value={editDescription} 
                  onChange={e => setEditDescription(e.target.value)} 
                  placeholder="Meeting description"
                />
                <TagsInput
                  tags={editTags}
                  onChange={setEditTags}
                  placeholder="Add tags..."
                />
              </div>
            ) : (
              <>
                <CardTitle className="text-base">
                  <Link to={`/meetings/${meeting.id}`} className="text-primary hover:underline">
                    {meeting.title}
                  </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                {meeting.tags && meeting.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {meeting.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/meetings/${meeting.id}`}>
                  <EyeIcon className="h-4 w-4 mr-2" /> View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startEdit(meeting)}>
                <PencilIcon className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeletingId(meeting.id)}>
                <TrashIcon className="h-4 w-4 mr-2 text-destructive" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {editingId === meeting.id ? (
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={() => saveEdit(meeting.id)} disabled={!editTitle.trim()}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <MeetingStatusChip status={meeting.status} />
            <span className="text-xs text-muted-foreground">
              {new Date(meeting.created_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-2 md:px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
              New Meeting
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleRecordClick}>
              <MicrophoneIcon className="h-4 w-4 mr-2" /> Record
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleUploadClick}>
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" /> Upload file
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden">
        {meetings.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-24">
              <p className="text-muted-foreground">No meetings found.</p>
            </CardContent>
          </Card>
        ) : (
          meetings.map(renderMobileCard)
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Table className="min-w-full text-sm text-left">
          <TableHeader>
            <TableRow className="bg-muted/60">
              <TableHead className="w-[250px] font-bold text-foreground px-6 py-3">Title</TableHead>
              <TableHead className="font-bold text-foreground px-6 py-3">Description</TableHead>
              <TableHead className="w-[200px] font-bold text-foreground px-6 py-3">Tags</TableHead>
              <TableHead className="w-[140px] font-bold text-foreground px-6 py-3">Status</TableHead>
              <TableHead className="w-[180px] font-bold text-foreground px-6 py-3">Created</TableHead>
              <TableHead className="w-[80px] text-right font-bold text-foreground px-6 py-3"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map((meeting) => (
              <TableRow key={meeting.id} className="transition-colors even:bg-muted/30 hover:bg-muted/80 border-b border-border last:border-0 group">
                {editingId === meeting.id ? (
                  <>
                    <TableCell className="font-medium text-primary px-6 py-3 rounded-l-xl group-first:rounded-tl-2xl group-last:rounded-bl-2xl">
                      <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full" />
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      <Input value={editDescription} onChange={e => setEditDescription(e.target.value)} className="w-full" />
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <TagsInput
                        tags={editTags}
                        onChange={setEditTags}
                        placeholder="Add tags..."
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <MeetingStatusChip status={meeting.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {new Date(meeting.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right px-6 py-3 rounded-r-xl group-first:rounded-tr-2xl group-last:rounded-br-2xl">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" onClick={() => saveEdit(meeting.id)} disabled={!editTitle.trim()}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={cancelEdit}>Cancel</Button>
                    </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium text-primary px-6 py-3 rounded-l-xl group-first:rounded-tl-2xl group-last:rounded-bl-2xl">
                      <Link to={`/meetings/${meeting.id}`} className="hover:text-primary">
                      {meeting.title}
                    </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">{meeting.description}</TableCell>
                    <TableCell className="px-6 py-3">
                      {meeting.tags && meeting.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {meeting.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {meeting.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{meeting.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <MeetingStatusChip status={meeting.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {new Date(meeting.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right px-6 py-3 rounded-r-xl group-first:rounded-tr-2xl group-last:rounded-br-2xl">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring">
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                    </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/meetings/${meeting.id}`}>
                              <EyeIcon className="h-4 w-4 mr-2" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startEdit(meeting)}>
                            <PencilIcon className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingId(meeting.id)}>
                            <TrashIcon className="h-4 w-4 mr-2 text-destructive" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {meetings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No meetings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AudioRecorderModal
        open={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onUploadSuccess={async (url: string) => {
          if (!user) return;
          await addMeeting({
            userId: user.uid,
            title: "Audio Meeting",
            description: "Recorded audio meeting",
            content: "",
            summary: "",
            status: "in progress",
            fileUrl: url,
            created_at: new Date().toISOString(),
            tags: [],
          });
          setIsRecordModalOpen(false);
          loadMeetings();
        }}
      />

      <FileUploadModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        accept="audio/*"
        onUploadSuccess={async (url: string) => {
          if (!user) return;
          await addMeeting({
            userId: user.uid,
            title: "Uploaded File Meeting",
            description: "Meeting with uploaded file",
            content: "",
            summary: "",
            status: "in progress",
            fileUrl: url,
            created_at: new Date().toISOString(),
            tags: [],
          });
          setIsUploadModalOpen(false);
          loadMeetings();
        }}
      />

      <AlertDialog open={!!deletingId} onOpenChange={open => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setDeletingId(null)} className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && confirmDelete(deletingId)} autoFocus className="w-full sm:w-auto">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 