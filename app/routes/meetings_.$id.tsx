import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useFetcher, useNavigate } from "@remix-run/react";
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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  if (!id) throw new Response("Not Found", { status: 404 });
  const meeting = await getMeetingById(id);
  if (!meeting) throw new Response("Not Found", { status: 404 });
  return json({ meeting });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const { id } = params;
  if (!id) return new Response("Not Found", { status: 404 });
  const formData = await request.formData();
  const content = formData.get("content");
  const summary = formData.get("summary");
  const update: any = {};
  if (typeof content === "string") update.content = content;
  if (typeof summary === "string") update.summary = summary;
  if (!Object.keys(update).length) return new Response("No valid fields", { status: 400 });
  await import("../services/meetings").then(({ updateMeeting }) => updateMeeting(id, update));
  return json({ success: true });
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
  const { meeting } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [contentValue, setContentValue] = useState(meeting.content);
  const [summaryValue, setSummaryValue] = useState(meeting.summary || "");
  const [summaryEditMode, setSummaryEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentChanged = contentValue !== meeting.content;
  const summaryChanged = summaryValue !== (meeting.summary || "");
  const isInProgress = meeting.status === "in progress";

  React.useEffect(() => {
    setContentValue(meeting.content);
  }, [meeting.content]);
  React.useEffect(() => {
    setSummaryValue(meeting.summary || "");
  }, [meeting.summary]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    navigate(`/meetings/${meeting.id}`, { replace: true });
    // Reset refreshing state after navigation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

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
                  <fetcher.Form method="post" className="self-end">
                    <input type="hidden" name="content" value={contentValue} />
                    <Button
                      type="submit"
                      disabled={contentValue === meeting.content || fetcher.state === 'submitting' || isInProgress}
                      size="sm"
                      className="text-sm"
                    >
                      {fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
                    </Button>
                  </fetcher.Form>
                </div>
              </TabsContent>
              <TabsContent value="summary" className="h-full">
                <div className="flex-1 min-h-0 flex flex-col gap-3 md:gap-4 h-full relative">
                  {isInProgress && <GeneratingOverlay type="summary" onRefresh={handleRefresh} isRefreshing={isRefreshing} />}
                  {summaryEditMode ? (
                    <>
                      <Editor value={summaryValue} onChange={setSummaryValue} />
                      <fetcher.Form method="post" className="self-end">
                        <input type="hidden" name="summary" value={summaryValue} />
                        <Button
                          type="submit"
                          disabled={!summaryChanged || fetcher.state === 'submitting' || isInProgress}
                          size="sm"
                          className="text-sm"
                        >
                          {fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
                        </Button>
                      </fetcher.Form>
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