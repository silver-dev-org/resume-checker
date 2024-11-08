import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout";
import { FormProvider } from "@/hooks/form-context";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </FormProvider>
    </QueryClientProvider>
  );
}
