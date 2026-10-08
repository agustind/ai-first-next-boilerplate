import { Geist, Geist_Mono } from 'next/font/google'

export const sans = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' })
export const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const fontVariables = `${sans.variable} ${mono.variable}`
