import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./global.css";

const poppinsSans = Poppins({
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    subsets: ["latin"]
});

export const metadata: Metadata = {
    title: "Dashboard - SignTry",
    description: "Manage signatures, track clicks, and view real-time analytics in one place.",
    icons: {
        icon: "/icon.svg",
        shortcut: "/icon.svg",
        apple: "/icon.svg",
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
                className={`${poppinsSans.className} h-full antialiased`}
            >
                <main className="absolute inset-0 w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    {children}
                </main>
            </body>
        </html>
    );
}
