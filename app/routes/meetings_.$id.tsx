import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useFetcher, useNavigate } from "@remix-run/react";
import { getMeetingById } from "../services/meetings";
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import React from "react";
import Editor from "../components/editor";
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

const GeneratingOverlay = ({ type }: { type: 'content' | 'summary' }) => (
  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
    </div>
    <div className="text-center">
      <p className="text-sm font-medium text-foreground mb-1">
        Generating {type}...
      </p>
      <p className="text-xs text-muted-foreground">
        AI is processing your meeting audio
      </p>
    </div>
  </div>
);

export default function MeetingDetailPage() {
  const { meeting } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [contentValue, setContentValue] = useState(meeting.content);
  const [summaryValue, setSummaryValue] = useState(meeting.summary || "");
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
    navigate(`/meetings/${meeting.id}`, { replace: true });
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-background w-full px-0 py-2">
      <Card className="w-full h-full flex flex-col">
        <CardHeader className="pb-2 px-4 md:px-6">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg md:text-xl break-words">
                    {meeting.title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {meeting.description || "No description"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <MeetingStatusChip status={meeting.status} />
                  <Button size="icon" variant="ghost" onClick={handleRefresh} title="Refresh" className="h-8 w-8 md:h-10 md:w-10">
                    <ArrowPathIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
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
        <CardContent className="pt-4 flex-1 flex flex-col px-4 md:px-6">
          <Tabs defaultValue="content" className="w-full h-full flex flex-col">
            <TabsList className="mb-4 h-9 md:h-10 bg-background justify-start w-full sm:w-auto">
              <TabsTrigger value="content" className="text-sm">Content</TabsTrigger>
              <TabsTrigger value="summary" className="text-sm">Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="h-full">
              <div className="flex-1 flex flex-col gap-3 md:gap-4 h-full relative">
                {isInProgress && <GeneratingOverlay type="content" />}
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
              <div className="flex-1 flex flex-col gap-3 md:gap-4 h-full relative">
                {isInProgress && <GeneratingOverlay type="summary" />}
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}