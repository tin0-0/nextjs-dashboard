// /app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
import { NextRequest } from "next/server"; // Import the correct Next.js request type

// Explicitly type the route parameters to enforce NextRequest compatibility bindings
export const GET = (req: NextRequest) => handlers.GET(req);
export const POST = (req: NextRequest) => handlers.POST(req);
