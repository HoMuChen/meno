import { useState, useEffect } from "react";
import { Meeting, listMeetings, addMeeting, updateMeeting, deleteMeeting, listMeetingsPaginated, PaginatedMeetings } from "../services/meetings";
import { useAuth } from "../components/auth";
import { Link } from "react-router-dom";
import { PlusIcon, PencilIcon, MicrophoneIcon, ArrowUpTrayIcon, TrashIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
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
import { ConfirmationDialog } from "../components/confirmationDialog";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";


export default function MeetingsPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [paginationData, setPaginationData] = useState<PaginatedMeetings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
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
      setIsLoading(true);
      const result = await listMeetingsPaginated(user.uid, pageSize);
      setPaginationData(result);
      setMeetings(result.meetings);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading meetings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextPage = async () => {
    if (!user || !paginationData?.hasMore || isLoading) return;
    try {
      setIsLoading(true);
      const result = await listMeetingsPaginated(user.uid, pageSize, paginationData.lastDoc);
      setPaginationData(result);
      setMeetings(result.meetings);
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error("Error loading next page:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreviousPage = async () => {
    if (!user || currentPage <= 1 || isLoading) return;
    try {
      setIsLoading(true);
      // For previous page, we need to reload from the beginning
      // This is a limitation of Firestore pagination
      const result = await listMeetingsPaginated(user.uid, pageSize);
      setPaginationData(result);
      setMeetings(result.meetings);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error loading previous page:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddMeeting = async (url: string) => {
    if (!user) return;
    await addMeeting({
      userId: user.uid,
      title: "Meeting",
      description: "Meeting added from audio or file",
      content: "",
      summary: "",
      status: "in progress",
      fileUrl: url,
      created_at: new Date().toISOString(),
    });
    loadMeetings();
  };

  const startEdit = (meeting: Meeting) => {
    setEditingId(meeting.id);
    setEditTitle(meeting.title);
    setEditDescription(meeting.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const saveEdit = async (id: string) => {
    await updateMeeting(id, { 
      title: editTitle, 
      description: editDescription
    });
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
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
              </div>
            ) : (
              <Link to={`/meetings/${meeting.id}`} className="block">
                <CardTitle className="text-base">
                  <span className="text-primary hover:underline">
                    {meeting.title}
                  </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
              </Link>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
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
          <Link to={`/meetings/${meeting.id}`} className="block">
            <div className="flex items-center justify-between">
              <MeetingStatusChip status={meeting.status} />
              <span className="text-xs text-muted-foreground">
                {new Date(meeting.created_at).toLocaleDateString()}
              </span>
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-2 md:px-4">
      <div className="flex justify-end mb-4 md:mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full md:w-auto">
              <PlusIcon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
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
                      <MeetingStatusChip status={meeting.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {new Date(meeting.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right px-6 py-3 rounded-r-xl group-first:rounded-tr-2xl group-last:rounded-br-2xl">
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
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
            {meetings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No meetings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6 px-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadPreviousPage}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Page {currentPage}
          {isLoading && " (Loading...)"}
        </span>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadNextPage}
          disabled={!paginationData?.hasMore || isLoading}
        >
          Next
          <ChevronRightIcon className="h-4 w-4 ml-2" />
        </Button>
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

      <ConfirmationDialog
        open={!!deletingId}
        onOpenChange={open => { if (!open) setDeletingId(null); }}
        onConfirm={() => deletingId && confirmDelete(deletingId)}
        description="Are you sure you want to delete this meeting? This action cannot be undone."
      />
    </div>
  );
}