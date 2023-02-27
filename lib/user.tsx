import { createContext, useState, useEffect, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";

import { Profile } from "../typings/User";
import analytics from "../lib/analytics";

import isDev, { url } from "./dev";
import supabase from "./supabase";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import LogRocket from "logrocket";

export type UserContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loaded: boolean;
  loginEmail: (email: string, password?: string) => Promise<any>;
  loginMagicLink: (email: string) => Promise<any>;
  loginProvider: (provider: "google" | "github" | "twitter") => Promise<any>;
  logout: () => Promise<any>;
};

export const UserContext = createContext<UserContextType>(undefined as any);

const UserProvider = (props: { children: any }) => {
  const { children } = props;
  const router = useRouter();
  const uuid = uuidv4();

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Fetch session and user data on load and login/logout
  useEffect(() => {
    async function fetchUser() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      // Error handling
      if (sessionError || userError) {
        sessionError && console.error(sessionError);
        userError && console.error(userError);
        return;
      }

      // Set Session and User
      setSession(sessionData.session ?? null);
      setUser(userData.user ?? null);
    }

    fetchUser();

    // Setup the Auth Listener for future changes to auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoaded(false); // load in profile data
        setSession(session ?? null);

        if (session) {
          setUser(session.user);
          await fetchProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
          setLoaded(true);
        }

        // if (event == "SIGNED_IN") console.log("SIGNED_IN", session);
        // if (event == "SIGNED_OUT") console.log("SIGNED_OUT", session);
        // if (event == "TOKEN_REFRESHED") console.log("TOKEN_REFRESHED", session);
        // if (event == "USER_UPDATED") console.log("USER_UPDATED", session);
        // if (event == "USER_DELETED") console.log("USER_DELETED", session);
        // if (event == "PASSWORD_RECOVERY")
        //   console.log("PASSWORD_RECOVERY", session);
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch profile data on user change
  useEffect(() => {
    if (user) {
      setLoaded(false); // loading
      fetchProfile(user);
    }
  }, [user]);

  // Get profile data, and create user tables if they don't exist yet
  async function fetchProfile(user: User) {
    // See if the user field is created in Profile. If not, create a field
    const { data: profile } = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.id)
      .single();

    // If the user doesn't have a profile, create one
    if (!profile) {
      // console.log("No profile, creating one for user");
      // Create the profile
      const { data: newProfile, error } = await supabase
        .from("profile")
        .insert([
          {
            id: user.id,
            email: user.email,
            subscription: "trial",
          },
        ])
        .single();

      if (newProfile) {
        // console.log("Created a new profile");
        setProfile(newProfile);
        // track new user -- cant tell if working :(
        LogRocket.getSessionURL(function (sessionURL) {
          analytics.track({
            userId: user?.id,
            anonymousId: uuid,
            event: "New User",
            properties: {
              user_email: user?.email,
              date: new Date(),
            },
          });
        });
      } else {
        console.error("Failed to create new profile for this user: ", error);
      }
    } else {
      setProfile(profile);
    }

    setLoaded(true);
  }

  async function loginEmail(email: string, password?: string) {
    throw new Error("Not implemented");
  }
  async function loginMagicLink(email: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: url(""),
      },
    });

    return data;
  }
  async function loginProvider(provider: "google" | "github" | "twitter") {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: url("/"),
      },
    });

    if (error) {
      alert(error.message);
    }
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setSession(null);
    setProfile(null);
    setLoaded(false);

    router.push("/");
  }

  const exposedContext: UserContextType = {
    user,
    session,
    profile,
    loaded,
    loginEmail,
    loginMagicLink,
    loginProvider,
    logout,
  };

  return (
    <UserContext.Provider value={exposedContext}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};

export default UserProvider;
