import React, {
    useEffect,
    useState,
    useRef,
    useMemo,
    useCallback,
  } from "react";
  import type { NextPage } from "next";
  import { useRouter } from "next/router";
  import Head from "next/head";
  import axios from "axios";
  axios.defaults.baseURL = 'http://47.113.194.193:3000';
  
  import { ChatFeed, Message } from "react-chat-ui";
  import {
    ChevronDownIcon,
    ChevronUpIcon,
    MinusIcon,
    PlusIcon,
    PlusSmallIcon,
  } from "@heroicons/react/24/outline";
  
  // import { Worker, Viewer } from "@react-pdf-viewer/core";
  // import "@react-pdf-viewer/core/lib/styles/index.css";
  // import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
  // import "@react-pdf-viewer/default-layout/lib/styles/index.css";
  import { pdfjs, Document, Page, Outline } from "react-pdf";
  import "react-pdf/dist/esm/Page/AnnotationLayer.css";
  import "react-pdf/dist/esm/Page/TextLayer.css";
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  
  //import analytics from "../lib/analytics";
  import { useUser } from "../lib/user";
  import supabase from "../lib/supabase";
  import LoadingSpinner from "../components/LoadingSpinner";
  import LogRocket from "logrocket";
  //import styles from "../styles/Outline.module.css";
  
  const Reader: NextPage = () => {
    const { user } = useUser();
    const router = useRouter();
  
    // const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [isSaved, setIsSaved] = useState(false);
    // pdf viewer
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [pdfText, setPdfText] = useState("");
  
    // explanations
    const [explanation, setExplanation] = useState("");
    const [highlightedString, setHighlightedString] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // messaging
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]); // chat messages
    const [chatLog, setChatLog] = useState("");
    const [textAbstract, setTextAbstract] = useState("");
  
    // get file path as soon as search params are read
    const filePath = useMemo(() => {
      return router.query.path as string;
    }, [router]);
  
    // get file name as soon as search params are read
    const fileName = useMemo(() => {
      // console.log("name: ", router.query.name);
      let name = router.query.name as string;
  
      // handle case where name is undefined
      if (!name) {
        console.error("name is undefined", router.query.name);
        name = "";
      }
  
      // handle names with % in them
      if (name.includes("%")) {
        name = name.replace(/%/g, " ");
      }
  
      return decodeURIComponent(name);
    }, [router]);
  
    // Identify to our analytics June
    useEffect(() => {
      if (user) {
        // analytics.identify({
        //   userId: user.id,
        //   traits: {
        //     email: user.email,
        //   },
        // });
      }
    }, [user]);
  
    // sets system theme
    useEffect(() => {
      const mq = window.matchMedia("(prefers-color-scheme: dark)"); // true if dark mode
      setIsDarkMode(mq.matches);
    }, []);
  
    // extract text from pdf
    const parsePdf = async (pdfFilePath: string) => {
      const res = await axios
        .post("/api/parseText", {
          pdfFilePath,
        })
        .catch((err) => {
          console.error("Error parsing the PDF text", err);
        });
  
      return res;
    };

  
    // finds title, abstract, and authors of the paper
    const fetchMetaData = async (firstPage: string) => {
      const res = await axios.post("/api/findMetaData", {
        firstPage,
      });
      return res.data;
    };
  
    const checkIfSaved = async (path: string) => {
      if (user) {
        // set saved state
        const { data, error } = await supabase
          .from("papers")
          .select("*")
          .eq("email", user.email)
          .eq("path", path)
          .single();
        if (data) {
          return true;
        } else {
          return false;
        }
      }
    };
  
    // get text and metadata from pdf
    useEffect(() => {
      if (filePath) {

        console.log("------------")
        console.log(filePath)


        checkIfSaved(filePath).then((res) => {
          setIsSaved(res);
        });
        parsePdf(filePath).then((res) => {
          if (res) {
            if (res.data.data) {
              //----------------------------------------------------------------------------
              //console.log("------------------")
              setPdfText(res.data.data);
              let full_text = res.data.data;
              let first_page = full_text.split("\n\n")[1];
  
              //console.log("first_page",first_page);
              

              fetchMetaData(first_page).then((res) => {
                if (res) {
                  // let abstract = res.abstract
                    // .split("abstract:")[1]
                    // .replace(`"`, "")
                    // .replace(`"}`, "");
                  //  console.log("-----------") 
                  // console.log("abstract", res.abstract);
                  setTextAbstract(res.abstract);
                } else {
                  alert(
                    "Error fetching paper meta-data. Please try again or contact us."
                  );
                  console.error("Error fetching metadata", res);
                  return;
                }
              });
            }
          }
        });
      }
    }, [filePath, fileName]);
  
    // gets context for highlighted text
    const getParagraph = (text: string, highlighted: string) => {
      // get the paragraph that the highlighted text is in
      // find \n that is before the highlighted text
      const firstNewlineIndex = text.lastIndexOf(
        "\n\n",
        text.indexOf(highlighted)
      );
  
      // find \n that is after the highlighted text
      const lastNewlineIndex = text.indexOf("\n\n", text.indexOf(highlighted));
      // get the paragraph
      const paragraph = text.slice(firstNewlineIndex, lastNewlineIndex);
      return paragraph;
    };
  
    // gets explanation for highlighted text
    const fetchApiExplanation = async (paragraph: string, text: string) => {
      setIsLoading(true);
      // The paragraph we use is the one in paper.paragraphs which matches the highlighted string
      const res = await axios.post("/api/explain", {
        paragraph,
        text,
      });
      return res.data.data;
    };
  
    // intitiates the q&a prompt once we parse the abstract
    useEffect(() => {
      if (textAbstract && highlightedString && explanation) {
        let init_prompt = `The following is the abstract for a research paper.
      Abstract: ${textAbstract}
      The reader has asked about: "${highlightedString}" and recieved the answer: "${explanation}".
      Answer follow-up questions about the paper as if they have 0 pre-existing knowledge of the topic. Be sure not to repeat yourself.
      Q: `;
        setChatLog(init_prompt);
      }
    }, [textAbstract, highlightedString, explanation]);
  
    // sends new prompt to chatbot upon new answer
    const answerQuestion = async (newPrompt: string) => {
      const res = await axios.post("/api/answer", {
        prompt: newPrompt,
      });
  
      return res.data.data;
    };
  
    // updates message log and creates new prompt
    const askQuestion = (input: string) => {
      // Add the user msg in the meantime
      setMessages([
        ...messages,
        {
          id: 0,
          message: input,
        },
      ]);
  
      let prompt =
        chatLog +
        input +
        `
      A: `;
      setChatLog(prompt);
      setInput("");
  
      answerQuestion(prompt).then((res: string) => {
        // re-add the user msg plus the answer msg
        setMessages([
          ...messages,
          {
            id: 0,
            message: input,
          },
          {
            id: 1,
            message: res,
          },
        ]);
  
        // update the chat log
        setChatLog(
          prompt +
            res +
            `
            Q: `
        );
  
           // Track the new question and data before it
        // analytics.track({
        //   userId: user?.id,
        //   event: "Question Answered",
        //   properties: {
        //     input_question: input,
        //     output_answer: res,
        //     input_highlighted: highlightedString,
        //     output_explanation: explanation,
        //     old_messages: prompt,
        //     paper: fileName,
        //   },
        // });
      });
    };
  
    // reset chatLog once explanation changes
    useEffect(() => {
      if (
        explanation !== "" &&
        explanation !== "..." &&
        highlightedString !== ""
      ) {
        setChatLog(
          `以下是一篇研究论文的摘要。
      摘要: ${textAbstract}
      读者询问了："${highlightedString}" 并得到了答案："${explanation}".
      回答关于论文的后续问题，就好像他们对该主题没有预先了解一样。一定不要重复你自己。
      Q: `
        );
        setMessages([]);
      }
    }, [explanation, highlightedString]);
  
    const savePaper = async () => {
      if (!isSaved) {
        // save paper to supabase
        const { data, error } = await supabase.from("papers").insert([
          {
            file_name: fileName,
            path: filePath,
            email: user.email,
            user_id: user.id,
          },
        ]);
  
        if (data) {
          LogRocket.getSessionURL(function (sessionURL) {
            // analytics.track({
            //   userId: user?.id,
            //   event: "Paper Saved",
            //   properties: {
            //     sessionURL,
            //     user: user?.email,
            //     paper: fileName,
            //   },
            // });
          });
        }
        if (error) {
          console.error("save error", error.message);
        }
      }
    };
  
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
  
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
  
    // truncate text if too long
    const start_and_end = (str: string) => {
      if (str.length > 100) {
        // truncate in the middle, make sure to keep the whole word on either end
        // find the first space after 150 chars
        const first_space = str.indexOf(" ", 50);
        // find the last space before 150 chars
        const last_space = str.lastIndexOf(" ", str.length - 50);
        // truncate
        return str.slice(0, first_space) + " . . . " + str.slice(last_space);
      }
      return str;
    };
  
    const [qaStart, setQaStart] = useState(false);
    const [collapseExplanation, setCollapseExplanation] = useState(false);
  
    const lightBubbleStyles = {
      text: {
        fontSize: 14,
        color: "#000",
      },
      chatbubble: {
        borderRadius: 20,
        padding: 10,
        backgroundColor: "#c4b5fd",
      },
      userBubble: {
        borderRadius: 20,
        padding: 10,
        backgroundColor: "#e5e7eb",
      },
    };
  
    const darkBubbleStyles = {
      text: {
        fontSize: 14,
        color: "#fff",
      },
      chatbubble: {
        borderRadius: 20,
        padding: 10,
        backgroundColor: "#3730a3",
      },
      userBubble: {
        borderRadius: 20,
        padding: 10,
        backgroundColor: "#4b5563",
      },
    };
  
    // #region New PDF Reader
    const [pageNumber, setPageNumber] = useState(1);
    const [numPages, setNumPages] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [showSearch, setShowSearch] = useState<boolean>(false);
    const [showOutline, setShowOutline] = useState<boolean>(false);
    const pages = useMemo(() => {
      return Array.from(new Array(numPages));
    }, [numPages]);
  
    // use react-pdf to render pdf file
    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
      setNumPages(numPages);
  
      // reset page number
      setPageNumber(1);
    }
  
    // #region Page Navigation
    const pageRef = useRef<HTMLDivElement>(null);
  
    // scroll to new page
    function changePage(offset: number) {
      // we're passing in page number directly from input
      if (offset != 1 && offset != -1) {
        setPageNumber(offset);
        const page = document.getElementById(`page_${offset}`);
        if (page) {
          page.scrollIntoView({ behavior: "smooth" });
        } else {
          console.error("page not found", page);
        }
        return;
      }
  
      setPageNumber((prevPageNumber) => prevPageNumber + offset);
  
      // scroll to new page
      const num = pageNumber + offset;
      const page = document.getElementById(`page_${num}`);
  
      if (page) {
        page.scrollIntoView({ behavior: "smooth" });
      } else {
        console.error("page not found", page);
      }
    }
  
    function previousPage() {
      changePage(-1);
    }
  
    function nextPage() {
      changePage(1);
    }
    // #endregion
  
    // #region search
    const [searchText, setSearchText] = useState("");
  
    function highlightPattern(text: string, pattern: any) {
      return text.replace(
        pattern,
        (value) => `<mark className="">${value}</mark>`
      );
    }
  
    const textRenderer = useCallback(
      (textItem: any) => highlightPattern(textItem.str, searchText),
      [searchText]
    );
  
    function onSearchChange(event: any) {
      setSearchText(event.target.value);
    }
  
    // #endregion
  
    // outline item click handler
    function onItemClick({ pageNumber: itemPageNumber }: any) {
      setPageNumber(itemPageNumber);
      const page = document.getElementById(`page_${itemPageNumber}`);
  
      if (page) {
        page.scrollIntoView({ behavior: "smooth" });
      } else {
        console.error("page not found", page);
      }
    }
  
    const [loadError, setLoadError] = useState(false);
    const [loadErrorMessage, setLoadErrorMessage] = useState("");
  
    // #endregion
  
    return (
      <div className="flex w-full mx-2 rounded-xl h-[89vh] bg-[#f5f5f5] dark:bg-[#1C1917]">
        <Head>
          <title>Explainpaper</title>
          <meta name="description" content={`Read ${fileName}`} />
          <link rel="icon" href="/logo.png" />
        </Head>
  
        {/* Left Side: Reader */}
        <div className="flex flex-col items-center flex-1 pb-8 mx-5 overflow-y-scroll overflow-x-clip lg:w-4/6 md:w-3/4 no-scrollbar">
          {/* save paper */}
          {filePath && user?.id && (
            <div className="flex justify-start w-full mt-3 ml-2">
              {!isSaved ? (
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:hover:bg-gray-600  dark:text-white px-2 py-1.5 rounded-sm"
                  onClick={() => {
                    savePaper();
                    setIsSaved(true);
                  }}
                >
                  <p className="flex items-center pb-0 font-sans text-sm">
                    <PlusSmallIcon className="w-4 h-4" /> Add To Saves
                  </p>
                </button>
              ) : (
                <p className="text-sm text-black/70 dark:text-white/70">
                  Paper is saved!
                </p>
              )}
            </div>
          )}
          {/* pdf viewer */}
          <div className="w-full">
            {filePath && (
              // TODO: test on different screen sizes // min-w-[890px] max-w-[890px]
              <div className="w-full mt-3">
                <div className="relative h-[80%] w-full bg-white/70 flex flex-col items-center justify-center">
                  {/* tool bar */}
                  <div className="sticky top-0 w-full h-12 bg-white dark:bg-gray-800 border-[1px] shadow-md border-gray-200 dark:border-gray-700 z-[1000]">
                    {filePath && numPages && (
                      <div className="flex justify-between mx-5 h-full items-center">
                        {/* left - search & table of contents */}
                        <div className="flex items-center space-x-3">
                          <button
                            title="Search"
                            className="flex justify-center items-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:hover:bg-gray-600  dark:text-white rounded-sm"
                            onClick={() => setShowSearch(!showSearch)}
                          >
                            {/* search */}
                            <div className="cursor-pointer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                />
                              </svg>
                            </div>
                          </button>
                          {/* table of contents */}
                          <div
                            onClick={() => setShowOutline(!showOutline)}
                            className="cursor-pointer flex justify-center items-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:hover:bg-gray-600  dark:text-white rounded-sm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-6 h-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                              />
                            </svg>
                          </div>
                        </div>
                        {/* middle - zoom */}
                        <div className="flex items-center">
                          <button
                            title="Zoom Out"
                            className="flex justify-center items-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:hover:bg-gray-600  dark:text-white rounded-sm"
                            onClick={() => {
                              setZoom(zoom - 0.1);
                            }}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="mx-2 text-sm font-semibold">
                            {Math.round(zoom * 100)}%
                          </span>
                          <button
                            title="Zoom In"
                            className="flex justify-center items-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:hover:bg-gray-600  dark:text-white rounded-sm"
                            onClick={() => {
                              setZoom(zoom + 0.1);
                            }}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        {/* right - pages nav */}
                        <div className="">
                          {/* up arrow */}
                          <div className="flex items-center space-x-1">
                            <button
                              title="Previous Page"
                              className="flex justify-center items-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:hover:bg-gray-600  dark:text-white rounded-sm"
                              disabled={pageNumber === 1}
                              onClick={previousPage}
                            >
                              <ChevronUpIcon className="w-4 h-4" />
                            </button>
                            {/* page number - editable */}
                            <div className="flex items-center text-center text-black dark:text-white ">
                              <input
                                type="text"
                                onFocus={(e) => {
                                  // auto select on focus
                                  e.target.select();
                                }}
                                className="w-5 h-6 bg-inherit rounded-sm bg-gray-100 dark:bg-gray-600 text-center focus:outline-none text-sm ml-2"
                                value={pageNumber}
                                onChange={(e) => {
                                  const pageNum = e.target.value;
                                  if (pageNumber >= 1 && pageNumber <= numPages) {
                                    setPageNumber(parseInt(pageNum));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    // console.log("changing page", pageNumber);
                                    changePage(pageNumber);
                                  }
                                }}
                              />
                              <p className="text-sm text-black/70 dark:text-white/80 px-2">{` / ${numPages}`}</p>
                            </div>
                            {/* down arrow */}
                            <button
                              title="Next Page"
                              className="flex justify-center items-center w-8 h-8 bg-gray-200 hover:bg-gray-300 text-black dark:bg-gray-700 dark:hover:bg-gray-600  dark:text-white rounded-sm"
                              disabled={pageNumber === numPages}
                              onClick={nextPage}
                            >
                              <ChevronDownIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* pdf viewer */}
                  <div
                    className="z-2 overflow-x-scroll w-full"
                    onMouseUpCapture={() => {
                      if (filePath && pdfText) {
                        if (window.getSelection().toString()) {
                          const highlight = window.getSelection()?.toString();
                          const paragraph = getParagraph(
                            pdfText,
                            highlight as string
                          );
                          setQaStart(false);
  
                          setHighlightedString(highlight || highlightedString);
  
                          if (highlight.length > 1) {
                            fetchApiExplanation(
                              paragraph as string,
                              highlight as string
                            )
                              .then((resp) => {
                                // LogRocket.getSessionURL(function (sessionURL) {
                                // analytics.track({
                                //   userId: user?.id,
                                //   event: "Highlight Explanation",
                                //   properties: {
                                //     // sessionURL,
                                //     input_highlighted: highlight,
                                //     output_explanation: resp,
                                //     paper: fileName,
                                //   },
                                // });
                                // });
                                setExplanation(resp);
                                setIsLoading(false);
                              })
                              .catch((err) => {
                                console.error("Explain error", err);
                              });
                          }
                        }
                      } else if (!pdfText) {
                        console.error("no context was grabbed yet");
                      }
                    }}
                  >
                    {/* search */}
                    {showSearch && (
                      <div className="absolute top-14 border border-1 border-gray-200 left-2 h-[5em] w-1/4 z-10 bg-white">
                        <div className="flex flex-col h-full w-full justify-center pl-4 space-y-2">
                          <p
                            className="text-sm text-black"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            Search your doc:
                          </p>
                          <input
                            type="search"
                            id="search"
                            autoFocus
                            value={searchText}
                            onChange={onSearchChange}
                            placeholder="Enter to search"
                            className="w-[90%] py-1 px-2 border border-1 border-black text-black rounded-md text-sm"
                          />
                        </div>
                      </div>
                    )}
                    <Document
                      className="w-full z-[100] overflow-x-scroll border-[1px] border-gray-200 dark:border-gray-700"
                      file={filePath as string}
                      loading={
                        <div className="text-black dark:text-white py-14 w-full flex justify-center items-center">
                          <LoadingSpinner size="large" />
                        </div>
                      }
                      onLoadSuccess={(pdf) => {
                        onDocumentLoadSuccess(pdf);
                        if (user) {
                          // track successful document load
                          // LogRocket.getSessionURL(function (sessionURL) {
                              // analytics.track({
                              //   userId: user?.id,
                              //   event: "PDF Loaded Successfully",
                              //   properties: {
                              //     // sessionURL,
                              //     paper: fileName,
                              //     paperLength: pdf.numPages,
                              //     userEmail: user?.email,
                              //   },
                              // });
                          // });
                        }
                      }}
                      error={
                        <div className="flex flex-col items-center justify-center w-full h-40 space-y-5 px-5">
                          <p className="text-2xl font-bold text-black">
                            <span className="text-red-500">Error: </span>
                            {loadErrorMessage}
                          </p>
                          <p className="text-sm text-black/70">
                            Please try again later, or contact us at{" "}
                            <a
                              href="mailto:
                                "
                              className="text-violet-500 underline underline-offset-4 cursor-pointer"
                            >
                              1758091620@qq.com
                            </a>
                          </p>
                        </div>
                      }
                      onLoadError={(error) => {
                        setLoadError(true);
                        setLoadErrorMessage(error.message);
                        // track unsuccessful document load
                        // LogRocket.getSessionURL(function (sessionURL) {
                              // analytics.track({
                              //   userId: user?.id,
                              //   event: "PDF Load Error",
                              //   properties: {
                              //     // sessionURL,
                              //     userEmail: user?.email,
                              //     paper: fileName,
                              //     error: error.message,
                              //   },
                              // });
                        // });
                      }}
                    >
                      <div>
                        {/* outline */}
                        {showOutline && (
                          <div className="w-1/3 absolute top-14 border border-1 border-gray-300 shadow-sm left-2 z-10 max-h-[calc(100vh-56px)] overflow-y-auto bg-gray-200 rounded-md overflow-scroll py-4">
                            <Outline
                              onItemClick={onItemClick}
                              className={styles.outline}
                            />
                          </div>
                        )}
                        {/* Pages */}
                        {Array.from(new Array(numPages), (el, index) => (
                          <div key={`page_${index + 1}`} id={`page_${index + 1}`}>
                            <Page
                              className="overflow-x-scroll"
                              inputRef={pageRef}
                              pageNumber={index + 1}
                              width={910} // TODO: make this responsive
                              scale={zoom}
                              customTextRenderer={textRenderer}
                              loading={
                                <div className="text-black dark:text-white py-14 w-full flex justify-center items-center">
                                  <LoadingSpinner size="small" />
                                </div>
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </Document>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* Right Side: Explanations and QA */}
        <div className="flex flex-col justify-between my-8 overflow-y-auto lg:w-2/6 md:w-1/4 relative z-10">
          {!qaStart && (
            <div className="mt-5">
              {highlightedString ? (
                <p className="pb-0 mx-5 my-2 text-black">
                  <span
                    title={highlightedString}
                    className="px-1 py-0.5 bg-yellow-500/70 dark:bg-yellow-500"
                  >
                    {start_and_end(highlightedString)}
                  </span>
                </p>
              ) : null}
              {explanation && !isLoading && (
                <div className="my-5 bg-gray-200 dark:bg-gray-700 rounded-md mx-5">
                  <p className="px-5 py-2 dark:text-white text-black leading-relaxed tracking-wide ">
                    {explanation}
                  </p>
                  {/* ask a question button */}
                  {explanation !== "..." && (
                    <p
                      onClick={() => setQaStart(true)}
                      className="flex items-center px-5 pb-3 hover:underline hover:underline-offset-2 hover:text-blue-500 text-blue-400 dark:hover:text-blue-300 text-sm tracking-wide cursor-pointer"
                    >
                      Ask a follow up question
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5 ml-2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                        />
                      </svg>
                    </p>
                  )}
                </div>
              )}
              {isLoading && (
                <div className="py-5 bg-gray-200 dark:bg-gray-700 rounded-md mx-5 justify-center flex">
                  <LoadingSpinner size="small" />
                </div>
              )}
              {!explanation && !isLoading && (
                <p className="px-5 py-2 font-sans dark:text-white">
                  Highlight text to have an AI explain it
                </p>
              )}
            </div>
          )}
  
          {/* QA chat popup */}
          {explanation && qaStart && (
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="flex flex-col justify-between w-[93%] mx-auto h-full p-5 overflow-y-auto bg-white dark:bg-gray-800 rounded-md">
                {/* exit svg */}
                <div className="z-10 absolute top-2 right-8">
                  <div
                    onClick={() => setQaStart(false)}
                    className="flex items-center justify-end w-full h-8"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 cursor-pointer"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
                {/* explanation */}
                <div className="h-fit w-full bg-gray-200 dark:bg-gray-700 px-3 py-3 mt-5 rounded-md max-h-[52%]">
                  <p className="text-[12px] uppercase text-black/50 dark:text-white/70 font-semibold pb-2">
                    explanation
                  </p>
                  <div className="max-h-[81%] overflow-y-auto">
                    {!collapseExplanation && (
                      <p className="text-sm tracking-[0.03em] leading-1">
                        {explanation}
                      </p>
                    )}
                    {collapseExplanation && (
                      <p className="text-sm tracking-[0.03em] leading-1">
                        {start_and_end(explanation)}
                      </p>
                    )}
                  </div>
                  {/* collapse explanation */}
                  {explanation.length > 100 && (
                    <div className="">
                      <div
                        onClick={() =>
                          setCollapseExplanation(!collapseExplanation)
                        }
                        className="flex items-center justify-end w-full pr-3"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 cursor-pointer"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              collapseExplanation
                                ? "M19 9l-7 7-7-7"
                                : "M5 15l7-7 7 7"
                            }
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                {/* chat */}
                <div className="flex flex-col justify-between h-full relative overflow-clip">
                  <div className="mx-3 overflow-y-scroll mb-[110px]">
                    <ChatFeed
                      messages={messages}
                      isTyping={false}
                      hasInputField={false}
                      bubblesCentered={false}
                      bubbleStyles={
                        isDarkMode ? darkBubbleStyles : lightBubbleStyles
                      }
                    />
                    <div ref={messagesEndRef} className="" />
                  </div>
                  <div className="flex items-center justify-between w-full mt-5 absolute bottom-0">
                    <textarea
                      autoFocus
                      className="w-full px-3 py-2 mb-1 text-black dark:text-white bg-gray-100 dark:bg-gray-600 rounded-md min-h-[100px] max-h-[400px]"
                      placeholder="Type your question here"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (input) {
                            askQuestion(input);
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default Reader;
  
