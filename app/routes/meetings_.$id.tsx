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

export default function MeetingDetailPage() {
  const { meeting } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [contentValue, setContentValue] = useState(meeting.content);
  const [summaryValue, setSummaryValue] = useState(meeting.summary || "");
  const contentChanged = contentValue !== meeting.content;
  const summaryChanged = summaryValue !== (meeting.summary || "");

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
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex flex-row items-center gap-4 flex-1">
                <CardTitle className="flex flex-row items-center gap-4">
                  <span>{meeting.title}</span>
                  <CardDescription className="mt-0">{meeting.description || "No description"}</CardDescription>
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <MeetingStatusChip status={meeting.status} />
                <Button size="icon" variant="ghost" onClick={handleRefresh} title="Refresh">
                  <ArrowPathIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {meeting.fileUrl && (
              <div className="flex items-center gap-2 w-full md:w-auto max-w-lg mt-4 mb-4">
                <audio controls src={meeting.fileUrl} className="w-full min-w-[240px] max-w-lg bg-muted rounded" style={{ height: 40 }} />
              </div>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 flex-1 flex flex-col">
          <Tabs defaultValue="content" className="w-full h-full flex flex-col">
            <TabsList className="mb-4 h-10 bg-background justify-start">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="h-full">
              <div className="flex-1 flex flex-col gap-4 h-full">
                <Editor value={contentValue} onChange={setContentValue} />
                <fetcher.Form method="post" className="self-end">
                  <input type="hidden" name="content" value={contentValue} />
                  <Button
                    type="submit"
                    disabled={contentValue === meeting.content || fetcher.state === 'submitting'}
                  >
                    {fetcher.state === 'submitting' ? 'Saving...' : 'Save'}
                  </Button>
                </fetcher.Form>
              </div>
            </TabsContent>
            <TabsContent value="summary" className="h-full">
              <div className="flex-1 flex flex-col gap-4 h-full">
                <Editor value={summaryValue} onChange={setSummaryValue} />
                <fetcher.Form method="post" className="self-end">
                  <input type="hidden" name="summary" value={summaryValue} />
                  <Button
                    type="submit"
                    disabled={!summaryChanged || fetcher.state === 'submitting'}
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