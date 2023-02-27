import React, { Fragment, useCallback, useEffect, useState } from "react";
import {
  CloudArrowUpIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { Transition } from "@headlessui/react";
import { useDropzone } from "react-dropzone";
import "katex/dist/katex.min.css";
import cx from "classnames";

import LoadingSpinner from "../components/LoadingSpinner";
import router from "next/router";
import { useUser } from "../lib/user";
import supabase from "../lib/supabase";

type Props = {};

const Upload = (props: Props) => {
  const { user } = useUser();
  const [uploadModal, setUploadModal] = useState(false);

  const [pdfName, setPdfName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleClick() {
    if (user) setUploadModal(true); // router.push("/upload");
    else router.push("/login");
  }

  // #region Handle file upload

  // handles pdf drop
  const onDrop = useCallback(async (acceptedFiles) => {
    setLoading(false);

    const allowedFiles = ["application/pdf"];
    let selectedFile = acceptedFiles[0];

    if (selectedFile && allowedFiles.includes(selectedFile.type)) {
      if (!selectedFile.name) {
        console.error("File does not have a name?");
      }
      setPdfName(selectedFile.name);

      setFile(selectedFile);
    } else {
      alert("Please select a PDF file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });
  // #endregion

  // #region upload from url
  const [inputUrl, setInputUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  const createFileFromUrl = async (inputUrl: string) => {
    // let link = "https://arxiv.org/pdf/2211.09778.pdf";
    let link = inputUrl;
    try {
      let response = await fetch(link, {
        method: "GET",
        // mode: "no-cors",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
      let data = await response.blob();
      let metadata = {
        type: "application/pdf",
      };
      let temp_name = link.split("/").pop();
      // await array buffer

      let file = new File([data], temp_name, metadata);
      console.log(file);
      setUrlLoading(false);
      return file;
    } catch (error) {
      alert(
        "Error uploading from URL. Please make sure the URL is a valid PDF."
      );
      setUrlLoading(false);
      return;
    }
  };

  // Handle input url - turn into file
  useEffect(() => {
    if (inputUrl) {
      // check if url is valid
      if (!inputUrl.includes("http")) {
        alert("Please enter a valid URL");
        setUrlLoading(false);
        return;
      }

      setUrlLoading(true);
      createFileFromUrl(inputUrl).then((file) => {
        if (file) {
          setFile(file);
          setPdfName(file.name);
        } else {
          console.error("Error creating file from URL", inputUrl);
        }
      });
    }
  }, [inputUrl]);

  // #endregion

  // upload to storage, then redirect to slug
  const handleStartReading = async (selectedFile) => {
    setLoading(true);

    // sluggify file name for upload
    let slug = selectedFile.name;

    // encode special characters users may have in their file names
    slug = encodeURIComponent(slug);
    // replace % with - to avoid issues with supabase
    slug = slug.replace(/%/g, "-");
    // console.log("slug:", "user_files/" + `${user.email}/` + slug);

    // upload file to supabase storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("pdf-files")
      .upload("user_files/" + `${user.email}/` + slug, selectedFile);

    if (!fileData && uploadError.message !== "The resource already exists") {
      alert(
        "There was an error uploading your file. Please try again or contact us."
      );
      console.error(uploadError.message);
      return;
    }

    // get the file path from storage
    const { data: publicURL } = supabase.storage
      .from("pdf-files")
      .getPublicUrl("user_files/" + `${user?.email}/` + slug);

      
          
    
    if (publicURL) {
      setLoading(false);
      // load pdfViewer page with the file object as a prop
      let filePath = publicURL.publicUrl;

      // pass the file path to the pdfViewer page as query params
      router.push(`/reader?path=${filePath}&name=${selectedFile.name}`);
      setUploadModal(false);
      setInputUrl("");
      setFile(null);
      setPdfName("");
      setUrlLoading(false);
    }
  };

  return (
    <div className="">
      <button
        className="flex items-center px-4 py-2 space-x-3 text-black border border-gray-400 rounded-md border-1 dark:text-white bg-gray-100 dark:bg-gray-900 transition-colors duration-150 hover:bg-gray-200 dark:hover:bg-gray-700"
        onClick={handleClick}
      >
        <CloudArrowUpIcon className="h-6 w-6 mb-0.5" />
        <p className="">Upload a paper</p>
      </button>
      <Dialog.Root open={uploadModal}>
        <Transition.Root show={uploadModal}>
          <Dialog.Portal>
            {/* Overlay */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay
                forceMount
                className="fixed inset-0 z-[1000] bg-black/50"
                onClick={() => {
                  setUploadModal(false);
                  setPdfName("");
                  setFile(null);
                  setInputUrl("");
                }}
              />
            </Transition.Child>
            <Dialog.Content
              className={cx(
                "fixed z-[1001] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
                "max-w-[800px] min-w-[560px] w-[40%] h-[40%] rounded-lg shadow-lg no-scrollbar overflow-hidden",
                // TODO: change this
                "bg-gray-100 dark:bg-gray-800 text-gray-200 focus:outline-none"
              )}
            >
              {/* upload */}
              <div className="flex flex-col w-full h-full items-center justify-center rounded-sm py-8">
                {!pdfName ? (
                  <div
                    {...getRootProps()}
                    className="flex flex-col justify-center h-[70%] w-[75%] text-lg rounded-md text-black dark:text-white bg-gray-50 dark:bg-gray-700 outline-dashed outline-[#8278c4]"
                  >
                    <input {...getInputProps()} />
                    <div className="flex items-center mx-auto text-black dark:text-white">
                      <DocumentPlusIcon className="mb-1 w-7 h-7" />
                      <p className="pl-2 text-medium">
                        拖拽 &amp; 或者{" "}
                        <label htmlFor="file-upload">
                          <span className="cursor-pointer text-[#8278c4] dark:text-[#A396F8] hover:underline hover:underline-offset-4">
                            浏览
                          </span>
                        </label>
                      </p>
                    </div>
                  </div>
                ) : (
                  // upload success: start analaysis
                  <div className="flex flex-col p-5 justify-center items-center space-y-5 text-gray-700 dark:text-white/80 bg-gray-50 dark:bg-gray-700 outline-dashed outline-[#8278c4] h-[70%] w-[75%] rounded-lg font-sans text-lg">
                    <div className="flex items-center text-center mx-auto text-black dark:text-white">
                      {pdfName}
                    </div>
                    {file && (
                      <button
                        onClick={() => handleStartReading(file)}
                        className="flex items-center text-sm px-4 py-2 bg-[#8278c4] rounded-md text-white w-fit"
                      >
                        Start Analyzing
                        {loading && (
                          <div className="pl-2">
                            <LoadingSpinner size="small" />
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* <p className="text-black/80 dark:text-white/80 mt-8 mb-1 w-[75%] text-sm pl-1">
                  Or upload from a link
                </p> */}

                {/* upload with a link instead */}
                {/* <div className="w-[75%] flex items-center space-x-2">
                  <input
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-1 border-[#8278c4] rounded-md text-black dark:text-white px-4 py-1.5 placeholder-opacity-10"
                    placeholder="https://arxiv.org/pdf/1706.03762.pdf"
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                  /> */}
                {/* {urlLoading ? (
                    <span className="text-[#8278c4]">
                      <LoadingSpinner />
                    </span>
                  ) : pdfName && inputUrl ? (
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-[#8278c4]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ) : null} */}
                {/* </div> */}
              </div>
              <Dialog.Close />
            </Dialog.Content>
          </Dialog.Portal>
        </Transition.Root>
      </Dialog.Root>
    </div>
  );
};

export default Upload;
