import { Link } from "react-router-dom";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { MeetingStatusChip } from "./meetingStatusChip";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import type { Meeting } from "~/services/meetings";

interface MeetingsTableProps {
  meetings: Meeting[];
  editingId?: string | null;
  editTitle?: string;
  editDescription?: string;
  onStartEdit?: (meeting: Meeting) => void;
  onSaveEdit?: (id: string) => void;
  onCancelEdit?: () => void;
  onDelete?: (id: string) => void;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  showActions?: boolean;
}

export function MeetingsTable({
  meetings,
  editingId,
  editTitle = "",
  editDescription = "",
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onTitleChange,
  onDescriptionChange,
  showActions = true,
}: MeetingsTableProps) {
  const renderMobileCard = (meeting: Meeting) => (
    <Card key={meeting.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {editingId === meeting.id ? (
              <div className="space-y-2">
                <Input 
                  value={editTitle} 
                  onChange={e => onTitleChange?.(e.target.value)} 
                  placeholder="Meeting title"
                />
                <Input 
                  value={editDescription} 
                  onChange={e => onDescriptionChange?.(e.target.value)} 
                  placeholder="Meeting description"
                />
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => onSaveEdit?.(meeting.id)} disabled={!editTitle.trim()}>
                    Save
                  </Button>
                  <Button size="sm" variant="secondary" onClick={onCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Link to={`/meetings/${meeting.id}`} className="block">
                <h3 className="font-medium text-primary hover:underline">
                  {meeting.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{meeting.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <MeetingStatusChip status={meeting.status} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(meeting.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            )}
          </div>
          {showActions && (
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
                  {onStartEdit && (
                    <DropdownMenuItem onClick={() => onStartEdit(meeting)}>
                      <PencilIcon className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(meeting.id)}>
                      <TrashIcon className="h-4 w-4 mr-2 text-destructive" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (meetings.length === 0) {
    return (
      <>
        {/* Mobile Empty State */}
        <div className="md:hidden">
          <Card>
            <CardContent className="flex items-center justify-center h-24">
              <p className="text-muted-foreground">No meetings found.</p>
            </CardContent>
          </Card>
        </div>

        {/* Desktop Empty State */}
        <div className="hidden md:block rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <Table className="min-w-full text-sm text-left">
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="w-[250px] font-bold text-foreground px-6 py-3">Title</TableHead>
                <TableHead className="font-bold text-foreground px-6 py-3">Description</TableHead>
                <TableHead className="w-[140px] font-bold text-foreground px-6 py-3">Status</TableHead>
                <TableHead className="w-[180px] font-bold text-foreground px-6 py-3">Created</TableHead>
                {showActions && <TableHead className="w-[80px] text-right font-bold text-foreground px-6 py-3"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={showActions ? 5 : 4} className="h-24 text-center text-muted-foreground">
                  No meetings found.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="md:hidden">
        {meetings.map(renderMobileCard)}
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
              {showActions && <TableHead className="w-[80px] text-right font-bold text-foreground px-6 py-3"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map((meeting) => (
              <TableRow key={meeting.id} className="transition-colors even:bg-muted/30 hover:bg-muted/80 border-b border-border last:border-0 group">
                {editingId === meeting.id ? (
                  <>
                    <TableCell className="font-medium text-primary px-6 py-3 rounded-l-xl group-first:rounded-tl-2xl group-last:rounded-bl-2xl">
                      <Input value={editTitle} onChange={e => onTitleChange?.(e.target.value)} className="w-full" />
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      <Input value={editDescription} onChange={e => onDescriptionChange?.(e.target.value)} className="w-full" />
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <MeetingStatusChip status={meeting.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground px-6 py-3">
                      {new Date(meeting.created_at).toLocaleString()}
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right px-6 py-3 rounded-r-xl group-first:rounded-tr-2xl group-last:rounded-br-2xl">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={() => onSaveEdit?.(meeting.id)} disabled={!editTitle.trim()}>Save</Button>
                          <Button size="sm" variant="secondary" onClick={onCancelEdit}>Cancel</Button>
                        </div>
                      </TableCell>
                    )}
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
                    {showActions && (
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
                            {onStartEdit && (
                              <DropdownMenuItem onClick={() => onStartEdit(meeting)}>
                                <PencilIcon className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem onClick={() => onDelete(meeting.id)}>
                                <TrashIcon className="h-4 w-4 mr-2 text-destructive" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}