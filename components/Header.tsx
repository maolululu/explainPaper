import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { UploadIcon } from "@radix-ui/react-icons";
import { BookmarkIcon } from "@heroicons/react/24/outline";

import { useUser } from "../lib/user";
import Upload from "../components/Upload";

const Header = () => {
  const router = useRouter();
  const headerRef = React.useRef<HTMLDivElement>(null);
  const { user, logout } = useUser();
  return (
    <div
      ref={headerRef}
      className="w-[100vw] flex items-center justify-between px-8 mt-5 mb-3 bg-gray-200 dark:bg-gray-800"
    >
      {/* Left side: title */}
      <h1
        className="z-10 text-xl font-semibold cursor-pointer"
        onClick={() => router.push(`/`)}
      >
        Explainpaper
      </h1>

      {/* Right side: nav */}
      <div className="flex items-center space-x-6">
        {user && (
          <button
            className="flex items-center h-10 px-5 rounded-md bg-gray-200 text-gray-900 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-50 dark:bg-gray-800 w-fit"
            onClick={() => router.push(`/mypdfs`)}
          >
            <BookmarkIcon className="w-5 h-5 mr-2 mb-0.5" />
            My papers
          </button>
        )}
        {/* Upload Button */}
        <Upload />

        {/* Profile Dropdown */}
        {user && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <div className="flex items-center justify-center w-10 h-10 ml-3 text-center text-white rounded-full cursor-pointer bg-green-700/70">
                {user.email![0].toUpperCase()}
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                className="w-56 mt-2 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-200 dark:border-gray-800 dark:hover:border-gray-700 rounded-md shadow-xl focus:outline-none mr-8"
              >
                <DropdownMenu.Item
                  onClick={logout}
                  className="px-3 py-2 cursor-pointer focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150"
                >
                  Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}

        {/* No user - Sign Up */}
        {!user && (
          <button
            className="flex items-center h-10 px-5 text-black dark:text-white rounded-md bg-gray-300 dark:bg-gray-600 w-fit"
            onClick={() => router.push(`/login`)}
          >
            Sign Up for Free
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
