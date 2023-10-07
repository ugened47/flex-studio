import { Suspense } from 'react';

import { Analytics } from '@vercel/analytics/react';
import cx from 'classnames';

import Footer from '@/components/layout/footer';
import Nav from '@/components/layout/nav';

import { inter, sfPro } from './fonts';
import './globals.css';

export const metadata = {
  title: 'Flex Studio - Building blocks for your Next.js project',
  description:
    'Flex Studio is the all-in-one solution for your Next.js project. It includes a design system, authentication, analytics, and more.',
  twitter: {
    card: 'summary_large_image',
    title: 'Flex Studio - Building blocks for your Next.js project',
    description:
      'Flex Studio is the all-in-one solution for your Next.js project. It includes a design system, authentication, analytics, and more.',
    creator: '@steventey',
  },
  metadataBase: new URL('https://flex-studio-ten.vercel.app'),
  themeColor: '#FFF',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cx(sfPro.variable, inter.variable)}>
        <div className="fixed h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-100" />
        <Suspense fallback="...">
          <Nav />
        </Suspense>
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
