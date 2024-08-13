
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Provider } from "../provider";
import { AppbarClient } from "../components/AppbarClient";


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Create Turborepo",
  description: "Generated by create turbo",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider>
      
      <body  className={inter.className}  >
      <AppbarClient/>
        {children}
      </body>
      </Provider>
    </html>
  );
}
