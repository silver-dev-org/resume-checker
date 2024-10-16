import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Resume checker</title>

        <link rel="icon" type="image/png" href="favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/png" href="favicon.ico" sizes="16x16" />
      </Head>
      <body className="antialiased dark dark:text-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
