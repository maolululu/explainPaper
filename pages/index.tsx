import React, { useState, Fragment, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import cx from "classnames";

import {
  CloudArrowUpIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";
import * as Dialog from "@radix-ui/react-dialog";
import { Transition } from "@headlessui/react";
import { useDropzone } from "react-dropzone";
import "katex/dist/katex.min.css";

import LoadingSpinner from "../components/LoadingSpinner";
import supabase from "../lib/supabase";
import { useUser } from "../lib/user";
import Upload from "../components/Upload";

export default function Home() {

  const { user, logout } = useUser();
  
  const router = useRouter();

  const [profileClick, setProfileClick] = useState(false);

  const [papers] = useState({
    paper1: {
      title: "Attention Is All You Need",
      authors: [
        "Ashish Vaswani",
        "Noam Shazeer",
        "Niki Parmar",
        "Jakob Uszkoreit",
        "Llion Jones",
        "Aidan N Gomez",
        "Lukasz Kaiser",
        "Alec Radford",
      ],
      link: "https://arxiv.org/abs/1706.03762",
      tldr: "Offers a new simple network architecture, the Transformer, which is based solely on attention mechanisms.",
    },
    // paper2: {
    //   title: "Transformers are Sample Efficient World Models",
    //   authors: ["Vincent Micheli", "Eloi Alonso", "François Fleuret"],
    //   link: "https://arxiv.org/abs/2209.00588",
    //   tldr: "Offers a new approach to deep reinforcement learning that is more sample efficient than previous methods.",
    // },
    // paper3: {
    //   title: "Understanding intermediate layers using linear classifier probes",
    //   authors: ["Guillaume Alain", "Yoshua Bengio"],
    //   link: "https://arxiv.org/abs/1610.01644",
    //   tldr: "Offers a new insight into neural network models by proposing to monitor the features at every layer of a model and measure how suitable they are for classification.",
    // },
  });

  

  const [uploadModal, setUploadModal] = useState(false);
  function handleClick() {
    if (user) setUploadModal(true); // router.push("/upload");
    else router.push("/login");
  }

  const [pdfName, setPdfName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
      .upload("user_files/" + `${user!.email}/` + slug, selectedFile);

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
    }
  };

  // #region upload from url
  const [inputUrl, setInputUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);

  const createFileFromUrl = async (inputUrl: string) => {
    // let link = "https://arxiv.org/pdf/2211.09778.pdf";
    let link = inputUrl;
    try {
      let response = await fetch(link, {
        method: "GET",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
      let data = await response.blob();
      let metadata = {
        type: "application/pdf",
      };
      let temp_name = link.split("/").pop();
      let file = new File([data], temp_name!, metadata);
      setUrlLoading(false);
      return file;
    } catch (error) {
      alert(
        "Error uploading from URL. Please make sure the URL is a valid PDF."
      );
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

  return (
    <div className="h-[89vh] flex flex-col w-full justify-start mx-2 bg-[#f5f5f5] dark:bg-[#1C1917] rounded-xl">
      <Head>
        <title>Explainpaper</title>
        <meta
          name="description"
          content="A better way to read academic papers."
        />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="flex flex-col items-center w-full pt-20 overflow-scroll no-scrollbar">
        <p className="pt-2 text-center text-4xl leading-normal text-black/80 dark:text-white w-[50%] max-w-[652px]">
          上传论文PDF,{" "}
          <span className="px-1 text-black bg-yellow-400">
            高亮 confusing text
          </span>
          , 得出解释.
        </p>
        <p className="pt-6 font-medium tracking-wide text-gray-500 dark:text-gray-300">
          A better way to read academic papers.
        </p>

        {/* Submission Box */}

        {/* modal */}
        <div className="mt-12">
          <Upload />
        </div>

        {/* Demo section */}
        <p className="pt-20 font-medium tracking-wide text-gray-500 dark:text-gray-300">
          Try out Explainpaper on the paper that started it all!
        </p>
        <div className="flex justify-center w-full py-5 mb-8">
          {/* Paper cards */}
          <div className="grid grid-cols-1 grid-rows-1 gap-10">
            {Object.keys(papers).map((paper) => {
              return (
                <Link
                  key={papers[paper].title}
                  href={
                    papers[paper].title === "Attention Is All You Need"
                      ? `/papers/attention`
                      : papers[paper].title ===
                        "Transformers are Sample Efficient World Models"
                      ? `/papers/transformers`
                      : papers[paper].title ===
                        "Understanding intermediate layers using linear classifier probes"
                      ? `/papers/intermediate`
                      : papers[paper].title ===
                        "Operationalizing Machine Learning: An Interview Study"
                      ? `/papers/operationalizing`
                      : papers[paper].title ===
                        "Retrieval-Augmented Diffusion Models"
                      ? `/papers/retrieval`
                      : papers[paper].title ===
                        "Semantic reconstruction of continuous language from non-invasive brain recordings"
                      ? `/papers/semantic`
                      : "/"
                  }
                >
                  <div className="relative flex flex-col w-64 h-56 px-5 pt-5 space-y-2 rounded-md shadow-md cursor-pointer bg-gray-50 dark:bg-gray-700 dark:shadow-black dark:hover:shadow-black hover:shadow-xl">
                    <h1 className="text-lg font-medium leading-snug text-gray-800 dark:text-gray-100">
                      {papers[paper].title}
                    </h1>
                    <h2 className="flex justify-start overflow-scroll text-sm font-normal text-gray-600 dark:text-gray-300 h-fit max-h-[50%] text-ellipses no-scrollbar">
                      {papers[paper].tldr}
                    </h2>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );


}
