import { Suspense } from 'react';

import { Analytics } from '@vercel/analytics/react';
import cx from 'classnames';

import Footer from '@/components/layout/footer';
import Nav from '@/components/layout/nav';

import { inter, sfPro } from '../fonts';
import '../globals.css';

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
  metadataBase: new URL('https://precedent.dev'),
  themeColor: '#FFF',
};

export default async function ProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen w-full flex-row pt-16">{children}</main>
  );
}
