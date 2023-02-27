import LogRocket from "logrocket";
//import * as Sentry from "@sentry/nextjs";
import { Analytics } from "@vercel/analytics/react";

import { SiteLayout } from "../components/layouts/SiteLayout";
import UserProvider from "../lib/user";
import "../styles/globals.css";

LogRocket.init("omsur7/explainpaper");
/*
Sentry.init({
  dsn: "https://78f6d988835a49cc98029c4c545aaee7@o4504239898361856.ingest.sentry.io/4504239900065792",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
LogRocket.getSessionURL((sessionURL) => {
  Sentry.configureScope((scope) => {
    scope.setExtra("sessionURL", sessionURL);
  });
});

*/
function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <SiteLayout>
        <Component {...pageProps} />
        <Analytics />
      </SiteLayout>
    </UserProvider>
  );
}

export default App;
