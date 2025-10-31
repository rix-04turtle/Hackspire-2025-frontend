import "@/styles/globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { GlobalContextProvider } from "@/contexts/GlobalContext";

export default function App({ Component, pageProps }) {
  return (
    <GlobalContextProvider>
      <LanguageProvider>
        <Component {...pageProps} />
      </LanguageProvider>
    </GlobalContextProvider>
  );
}
