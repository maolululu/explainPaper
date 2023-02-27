import { useEffect } from "react";
import { useRouter } from "next/router";

import { Auth, ThemeSupa } from "@supabase/auth-ui-react";

import { url } from "../lib/dev";
import { useUser } from "../lib/user";
import supabase from "../lib/supabase";

const Login = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [router, user]);

  if (!user)
    return (
      <div className="flex flex-col items-center w-full p-4 pt-32 m-2 bg-gray-100 rounded-xl dark:bg-gray-900">
        <h1 className="mb-12 text-3xl">Login to Explainpaper</h1>
        <Auth
          redirectTo={url("")}
          appearance={{
            theme: ThemeSupa,
            style: { container: { width: "350px" } },
          }}
          theme={
            typeof window !== "undefined"
              ? window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "default"
              : undefined
          }
          supabaseClient={supabase}
          providers={["google", "github"]}
          socialLayout="horizontal"
        />
      </div>
    );
};

export default Login;
