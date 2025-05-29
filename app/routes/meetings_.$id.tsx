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

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Markdown renderer component using markdown-it
const MarkdownRenderer = ({ content }: { content: string }) => {
  const html = md.render(content);

  return (
    <div 
      className="markdown-content text-foreground w-full h-full text-base text-gray-900 bg-white rounded-md focus:outline-none resize-none"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        lineHeight: '1.6',
      }}
    />
  );
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
      <style>{`
        .markdown-content h1 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem 0; }
        .markdown-content h2 { font-size: 1.25rem; font-weight: 600; margin: 0.875rem 0 0.5rem 0; }
        .markdown-content h3 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.5rem 0; }
        .markdown-content h4 { font-size: 1rem; font-weight: 600; margin: 0.75rem 0 0.5rem 0; }
        .markdown-content h5 { font-size: 0.875rem; font-weight: 600; margin: 0.75rem 0 0.5rem 0; }
        .markdown-content h6 { font-size: 0.75rem; font-weight: 600; margin: 0.75rem 0 0.5rem 0; }
        .markdown-content p { margin: 0.5rem 0; }
        .markdown-content ul { 
          margin: 0.5rem 0; 
          padding-left: 1.5rem; 
          list-style-type: disc;
        }
        .markdown-content ol { 
          margin: 0.5rem 0; 
          padding-left: 1.5rem; 
          list-style-type: decimal;
        }
        .markdown-content li { 
          margin: 0.25rem 0;
          display: list-item;
        }
        .markdown-content ul li::marker {
          color: hsl(var(--muted-foreground));
        }
        .markdown-content ol li::marker {
          color: hsl(var(--muted-foreground));
        }
        .markdown-content ul ul {
          list-style-type: circle;
        }
        .markdown-content ul ul ul {
          list-style-type: square;
        }
        .markdown-content ol ol {
          list-style-type: lower-alpha;
        }
        .markdown-content ol ol ol {
          list-style-type: lower-roman;
        }
        .markdown-content blockquote { 
          border-left: 4px solid hsl(var(--border)); 
          padding-left: 1rem; 
          margin: 1rem 0; 
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        .markdown-content code { 
          background: hsl(var(--muted)); 
          padding: 0.125rem 0.25rem; 
          border-radius: 0.25rem; 
          font-size: 0.875rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
        }
        .markdown-content pre { 
          background: hsl(var(--muted)); 
          padding: 1rem; 
          border-radius: 0.5rem; 
          overflow-x: auto; 
          margin: 1rem 0;
        }
        .markdown-content pre code { 
          background: none; 
          padding: 0; 
        }
        .markdown-content a { 
          color: hsl(var(--primary)); 
          text-decoration: underline;
        }
        .markdown-content a:hover { 
          color: hsl(var(--primary)); 
          opacity: 0.8;
        }
        .markdown-content strong { font-weight: 600; }
        .markdown-content em { font-style: italic; }
        .markdown-content hr { 
          border: none; 
          border-top: 1px solid hsl(var(--border)); 
          margin: 1.5rem 0; 
        }
        .markdown-content table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 1rem 0; 
        }
        .markdown-content th, .markdown-content td { 
          border: 1px solid hsl(var(--border)); 
          padding: 0.5rem; 
          text-align: left; 
        }
        .markdown-content th { 
          background: hsl(var(--muted)); 
          font-weight: 600; 
        }
      `}</style>
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
                      {meeting.tags && meeting.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {meeting.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
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