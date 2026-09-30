// /app/layout.tsx
import '@/app/ui/global.css';
// 👇 Import the inter font utility configuration
import { inter } from './ui/fonts'; 
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 👇 Inject inter.className into the body wrapper */}
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
