import { User2 } from "lucide-react"
import { useAuth } from "./auth"
import { useNavigate, Link } from "@remix-run/react"
import { auth } from "../firebase"
import { signOut } from "../firebase/auth"
import { useState, useEffect } from "react"
import { Meeting, listMeetings } from "../services/meetings"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "./ui/sidebar"

export function AppSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);

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

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="text-xl md:text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
          Meno
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">
            Meetings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="max-h-[calc(100vh-16rem)] overflow-y-auto">
              {meetings.length === 0 ? (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  No meetings found
                </div>
              ) : (
                meetings.map((meeting) => (
                  <SidebarMenuItem key={meeting.id}>
                    <SidebarMenuButton asChild className="text-sm">
                      <Link to={`/meetings/${meeting.id}`}>
                        <span className="truncate" title={meeting.title}>
                          {meeting.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 py-4">
        {user && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-3 p-2 rounded-md bg-muted/40">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-9 h-9 rounded-full object-cover border" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {user.displayName ? user.displayName[0] : <User2 className="h-5 w-5" />}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm truncate">{user.displayName || "User"}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full py-1.5 rounded-md bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
            >
              Log out
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
