import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { DynamicBreadcrumb } from "./dynamic-breadcrumb";
import { AppSidebar } from "./app-sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-background">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full flex bg-background text-foreground">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 flex flex-col min-h-screen bg-background">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </header>
            <div className="flex-1 flex flex-col min-h-0 p-4">
              {children}
            </div>
          </main>
        </SidebarProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
