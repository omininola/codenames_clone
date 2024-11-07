import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AppWrapper } from "@/context";

const poppins = Poppins({
  display: "swap",
  weight: ["400", "600", "800"],
  style: "normal",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codenames da galera",
  description: "Bora jogar codenames?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.className}`}>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
