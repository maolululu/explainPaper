import React, { useState } from "react";
import { useRouter } from "next/router";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

import supabase from "../lib/supabase";
import { useUser } from "../lib/user";

type Props = {
  fileName?: string;
  filePath: string;
  isOpen?: boolean;
};

const PaperPreview = (props: Props) => {
  const { filePath, fileName, isOpen } = props;
  const router = useRouter();
  const { user } = useUser();

  const [pageX, setPageX] = useState(0);
  const [pageY, setPageY] = useState(0);

  const [editing, setEditing] = useState(false);

  const handleDelete = async (path: string) => {
    // console.log("deleting file: ", path);

    const { data: deleted, error: err } = await supabase
      .from("papers")
      .delete()
      .match({ path: path });

    if (err) {
      console.error("deletion error", err);
    } else {
      // reload page
      window.location.reload();
      setEditing(false);
    }
  };

  return (
    <div className="relative">
      {filePath && (
        <button
          onClick={() => {
            setEditing(!editing);
          }}
          className="opacity-100 z-[1000] hover:text-black text-gray-800 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-300 dark:focus:bg-gray-300 dark:focus:text-black focus:bg-white px-2 py-1 rounded-lg"
        >
          <EllipsisHorizontalIcon className="h-5 w-5 opacity-100 " />
        </button>
      )}
      {editing && (
        <div
          onClick={() => handleDelete(filePath)}
          className="bg-gray-100 absolute top-9 cursor-pointer left-1 w-1/3 z-[1000] hover:bg-red-500 transition text-black hover:text-white py-1 rounded-md text-center shadow-lg"
        >
          <p className="">Delete</p>
        </div>
      )}
      <div className="relative h-fit w-fit shadow-md rounded-xl">
        <div
          onClick={() => {
            if (!editing) {
              router.push(`/reader?path=${filePath}&name=${fileName}`);
            }
          }}
          className="hover:opacity-70 transition-opacity opacity-0 bg-gray-700 dark:bg-gray-900 cursor-pointer h-96 w-full rounded-sm absolute z-10 top-0"
        >
          <p className="text-white opacity-100 text-center pt-24 px-5 z-[1000]">
            {fileName}
          </p>
        </div>
        {filePath && (
          <iframe
            className="h-96 w-full z-0 overflow-hidden shadow-md border-4 border-gray-200 dark:border-gray-700" // border-2 border-gray-200 "
            src={`${filePath}#toolbar=0&navpanes=0&scrollbar=0`}
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default PaperPreview;
