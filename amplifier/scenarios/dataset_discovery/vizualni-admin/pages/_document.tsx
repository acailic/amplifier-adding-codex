import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="sr">
      <Head>
        <meta name="description" content="Vizuelni Admin Panel - Analiza i vizuelizacija srpskih podataka" />
        <link rel="icon" href="/favicon.ico" />
        </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}