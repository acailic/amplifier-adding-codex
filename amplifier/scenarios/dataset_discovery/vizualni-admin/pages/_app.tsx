import React from 'react';
import type { AppProps } from 'next/app';
// Temporarily disable i18n
// import { appWithTranslation } from 'next-i18next';
import '@/styles/globals.css';

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;