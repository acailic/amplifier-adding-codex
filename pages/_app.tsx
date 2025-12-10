import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navigation from '../components/navigation';
import '../styles/globals.css';

// Service worker disabled for static GitHub Pages deployment
// Service workers require proper HTTPS scope configuration which is
// complex with GitHub Pages subdirectory deployments

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Show navigation on all pages except homepage
  const showNavigation = router.pathname !== '/';

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {showNavigation && <Navigation />}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
