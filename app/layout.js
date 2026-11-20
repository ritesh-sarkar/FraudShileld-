import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  title: 'FraudShield — AI Fraud Intelligence & Transaction Monitoring',
  description:
    'AI-powered financial fraud detection, real-time transaction monitoring, and graph intelligence dashboard prototype.',
  openGraph: {
    title: 'FraudShield — AI Fraud Intelligence & Transaction Monitoring',
    description:
      'AI-powered financial fraud detection, real-time transaction monitoring, and graph intelligence dashboard prototype.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FraudShield — AI Fraud Intelligence & Transaction Monitoring',
    description:
      'AI-powered financial fraud detection, real-time transaction monitoring, and graph intelligence dashboard prototype.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#F8FAFC] text-[#0F172A] antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
