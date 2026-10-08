// /app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"; // Re-routes network methods directly to your fresh auth.ts pooling
export { handlers as GET, handlers as POST };
