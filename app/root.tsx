import {
  Outlet,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { Layout } from "./components/layout";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function meta() {
  return [
    { title: "Meno - Meeting Notes App" },
    { name: "description", content: "A modern meeting notes and recording app" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
