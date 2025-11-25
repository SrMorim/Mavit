import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Mavit - Mega App de Produtividade",
  description: "O app completo para gerenciar suas tarefas, calendário, notas, listas e finanças em um só lugar.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${dmSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
