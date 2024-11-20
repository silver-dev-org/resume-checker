import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="icon"
          type="image/png"
          href="images/favicon-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          type="image/png"
          href="images/favicon-16x16.png"
          sizes="16x16"
        />
      </Head>
      <body className="antialiased dark dark:text-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
