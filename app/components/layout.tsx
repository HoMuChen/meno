import {
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { DynamicBreadcrumb } from "./dynamic-breadcrumb";
import { AppSidebar } from "./app-sidebar";
import { Auth } from "./auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  // Check if we're on a meeting detail page
  const isMeetingDetailPage = location.pathname.match(/^\/meetings\/[^\/]+$/);

  return (
    <html lang="en" className="h-full bg-background">
      <head>
        <Meta />
        <Links />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-full flex bg-background text-foreground">
        <Auth>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 flex flex-col min-h-screen bg-background">
              <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b px-2 md:px-4 bg-background">
                <SidebarTrigger className="-ml-1" />
                {!isMeetingDetailPage && (
                  <>
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="min-w-0 flex-1">
                      <DynamicBreadcrumb />
                    </div>
                  </>
                )}
              </header>
              <div className="flex-1 flex flex-col min-h-0 p-2 md:p-4">
                {children}
              </div>
            </main>
          </SidebarProvider>
        </Auth>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
