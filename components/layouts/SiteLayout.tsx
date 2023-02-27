import clsx from "clsx";
import LogRocket from "logrocket";

//import Navbar from "../Navbar";
import Header from "../Header";
import { useUser } from "../../lib/user";

export function SiteLayout({ children }) {
  const { user } = useUser();

  LogRocket.identify(user?.id, {
    email: user?.email,
  });

  return (
    <div
      className={clsx(
        "relative flex flex-col w-full h-screen",
        "text-black dark:text-white bg-gray-200 dark:bg-gray-800"
      )}
    >
      {/* {user && <Navbar />} */}
      <Header />
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
