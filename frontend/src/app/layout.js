import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "AnimeFav",
  description: "Tu plataforma personal de seguimiento de anime",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geist.variable} antialiased bg-gray-950 text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}