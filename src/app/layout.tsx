import type { Metadata } from "next";
import { geist } from "./fonts";
import "./global.css";

export const metadata: Metadata = {
    title: "Dashboard - SignTry",
    description: "Manage signatures, track clicks, and view real-time analytics in one place.",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full">
            <body
                className={`${geist.variable} h-full antialiased`}
            >
                <main className="absolute inset-0 w-full bg-cream">
                    {children}
                </main>
            </body>
        </html>
    );
}
