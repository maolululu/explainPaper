import React, { useState, useEffect } from "react";

import { useUser } from "../lib/user";
import supabase from "../lib/supabase";
import PaperPreview from "../components/paperPreview";

const Mypdfs = () => {
  if (typeof document === "undefined") {
    React.useLayoutEffect = React.useEffect;
  }

  const { user } = useUser();

  const [pdfs, setPdfs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);


  //console.log(user.id);
  // c599a2f6-b128-4a16-8fb1-d528b2bfc8c0 


  const getUserPDFs = async () => {
    const { data, error } = await supabase
      .from("papers")
      .select("path, file_name")
      .eq("user_id", user.id);

    if (error) {
      console.error("Get papers error", error);
    } else {
      return data;
    }
  };

  // if user, get their pdfs as urls
  useEffect(() => {
    if (user && pdfs.length === 0) {
      getUserPDFs().then((data) => {
        // reverse order so most recent is first
        setPdfs(data.reverse());
      });
    }
  }, [user]);

  return (
    <div
      className="mx-2 h-[89vh] rounded-xl bg-gray-100 dark:bg-[#1C1917] w-full overflow-y-auto no-scrollbar pb-12"
      onClick={() => setIsOpen(false)}
    >
      <h1 className="text-xl dark:text-white text-black mt-14 mx-10">
        Saved Papers
      </h1>

      {pdfs.length !== 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mx-10 mt-10 w-fit gap-x-8 gap-y-8">
          {pdfs.map((pdf, i) => {
            return (
              <PaperPreview
                key={i}
                isOpen={isOpen}
                filePath={pdf.path}
                fileName={pdf.file_name}
              />
            );
          })}
        </div>
      ) : (
        <div className="mx-10 mt-14">
          <p className=" dark:text-white/70 text-black/70">
            You have no saved papers. Upload a paper to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Mypdfs;
