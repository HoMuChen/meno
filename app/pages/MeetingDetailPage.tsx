import { Link, useNavigate, useParams } from "react-router-dom";
import { getMeetingById } from "../services/meetings";
import { ArrowDownTrayIcon, ArrowPathIcon, TagIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import React from "react";
import Editor from "../components/editor";
import MarkdownIt from "markdown-it";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { MeetingStatusChip } from "../components/meetingStatusChip";
import "../styles/markdown.css";

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Markdown renderer component using markdown-it
const MarkdownRenderer = ({ content }: { content: string }) => {
  const html = md.render(content);
  return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
};


const GeneratingOverlay = ({ type, onRefresh, isRefreshing }: { type: 'content' | 'summary', onRefresh: () => void, isRefreshing: boolean }) => (
  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
    </div>
    <div className="text-center mb-4">
      <p className="text-sm font-medium text-foreground mb-1">
        {isRefreshing ? 'Refreshing...' : `Generating ${type}...`}
      </p>
      <p className="text-xs text-muted-foreground">
        {isRefreshing ? 'Checking for updates' : 'AI is processing your meeting audio'}
      </p>
    </div>
    <Button 
      size="sm" 
      variant="outline" 
      onClick={onRefresh}
      className="text-xs"
      disabled={isRefreshing}
    >
      {isRefreshing ? (
        <>
          <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
          Refreshing...
        </>
      ) : (
        <>
          <ArrowPathIcon className="h-3 w-3 mr-1" />
          Refresh
        </>
      )}
    </Button>
  </div>
);

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contentValue, setContentValue] = useState("");
  const [summaryValue, setSummaryValue] = useState("");
  const [summaryEditMode, setSummaryEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const contentChanged = meeting && contentValue !== meeting.content;
  const summaryChanged = meeting && summaryValue !== (meeting.summary || "");
  const isInProgress = meeting && meeting.status === "in progress";

  React.useEffect(() => {
    if (id) {
      loadMeeting();
    }
  }, [id]);
  
  React.useEffect(() => {
    if (meeting) {
      setContentValue(meeting.content || "");
      setSummaryValue(meeting.summary || "");
    }
  }, [meeting]);
  
  const loadMeeting = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const meetingData = await getMeetingById(id);
      if (meetingData) {
        setMeeting(meetingData);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error loading meeting:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };
  
  const saveMeeting = async (updates: any) => {
    if (!id) return;
    try {
      setSaving(true);
      await import("../services/meetings").then(({ updateMeeting }) => updateMeeting(id, updates));
      await loadMeeting();
    } catch (error) {
      console.error("Error saving meeting:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMeeting();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!meeting) {
    return <div className="flex items-center justify-center h-screen">Meeting not found</div>;
  }

  return (
    <>
      <div className="h-[calc(100vh-5rem)] bg-background w-full px-0 py-2">
        <Card className="w-full h-full flex flex-col">
          <CardHeader className="pb-2 px-4 md:px-6">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <CardTitle className="text-lg md:text-xl break-words">
                        {meeting.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {meeting.description || "No description"}
                    </CardDescription>
                  </div>
                </div>
              </div>
              {meeting.fileUrl && (
                <div className="flex items-center gap-2 w-full mt-3 mb-2">
                  <audio 
                    controls 
                    src={meeting.fileUrl} 
                    className="w-full bg-muted rounded" 
                    style={{ height: 36 }}
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 flex-1 flex flex-col px-4 md:px-6 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="h-9 md:h-10 bg-background w-auto">
                  <TabsTrigger value="content" className="text-sm">Content</TabsTrigger>
                  <TabsTrigger value="summary" className="text-sm">Summary</TabsTrigger>
                </TabsList>
                {activeTab === "summary" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={!summaryEditMode ? "default" : "outline"}
                      onClick={() => setSummaryEditMode(false)}
                      className="text-xs"
                    >
                      <EyeIcon className="h-1 w-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant={summaryEditMode ? "default" : "outline"}
                      onClick={() => setSummaryEditMode(true)}
                      className="text-xs"
                      disabled={isInProgress}
                    >
                      <PencilIcon className="h-1 w-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
              <TabsContent value="content" className="h-full">
                <div className="flex-1 flex flex-col gap-3 md:gap-4 h-full relative">
                  {isInProgress && <GeneratingOverlay type="content" onRefresh={handleRefresh} isRefreshing={isRefreshing} />}
                  <Editor value={contentValue} onChange={setContentValue} />
                  <Button
                    onClick={() => saveMeeting({ content: contentValue })}
                    disabled={!contentChanged || saving || isInProgress}
                    size="sm"
                    className="text-sm"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="summary" className="h-full">
                <div className="flex-1 min-h-0 flex flex-col gap-3 md:gap-4 h-full relative">
                  {isInProgress && <GeneratingOverlay type="summary" onRefresh={handleRefresh} isRefreshing={isRefreshing} />}
                  {summaryEditMode ? (
                    <>
                      <Editor value={summaryValue} onChange={setSummaryValue} />
                      <Button
                        onClick={() => saveMeeting({ summary: summaryValue })}
                        disabled={!summaryChanged || saving || isInProgress}
                        size="sm"
                        className="text-sm"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <div className="flex-1 min-h-0 h-full px-4 py-2">
                      {summaryValue ? (
                        <MarkdownRenderer content={summaryValue} />
                      ) : (
                        <p className="text-muted-foreground text-sm italic">No summary available</p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}