import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLISS CONTENTS — Selected Works",
  description:
    "BLISS CONTENTS의 영화, 드라마, 광고 콘텐츠 스틸 포트폴리오.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
