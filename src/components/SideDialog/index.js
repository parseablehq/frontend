/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import moment from "moment";

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export default function SideDialog({ open, setOpen, data }) {
  const [log, setLog] = useState({});

  // const str =
  //   Object.keys(data).length !== 0
  //     ? data?.log.replace(/"([^"]+)":/g, "$1:")
  //     : "";

  // JSON.parse(str)

  // console.log(data?.log);

  // console.log(JSON.parse(`${Object.keys(data).length !== 0 ? data?.log : ""}`));
  // console.log(JSON.parse(`${data?.log}`));
  // console.log(
  //   JSON.parse(
  //     `{"host":"176.94.62.153", "user-identifier":"wehner6461", "datetime":"24/Jun/2022:14:11:59 +0000", "method": "POST", "request": "/schemas/facilitate/engage", "protocol":"HTTP/2.0", "status":502, "bytes":4859, "referer": "https://www.forwardstreamline.net/e-tailers"}`
  //   )
  // );

  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      setLog(JSON.parse(`${data?.log}`));
    } else {
    }
  }, [data]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="bg-drawerBlue py-1 px-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-xs flex items-center font-medium text-white">
                          {/* <div className="">
                            <div>Status</div>
                            <div className="mt-1 text-sky-500 flex space-x-1 items-center">
                              <ExclamationCircleIcon className="w-4" />
                              <div>info</div>
                            </div>
                          </div> */}
                          {/* <div className="w-px h-6 mx-5 bg-gray-500"></div> */}
                          <div className="">
                            <div className="flex space-x-10">
                              <div>Timestamp</div>
                            </div>
                            <div className="mt-1 text-white flex space-x-1 items-center">
                              <div>
                                {moment
                                  .utc(data?.time)
                                  .format("DD/MM/YYYY,HH:mm:ss")}
                              </div>
                            </div>
                          </div>
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-bluePrimary text-white hover:text-white focus:outline-none "
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      {/* <div className="mt-1">
                        <p className="text-sm text-indigo-300">
                         {data?.time}
                        </p>
                      </div> */}
                    </div>
                    <div className="relative flex-1 py-1 px-4 sm:px-6">
                      {/* Replace with your content */}
                      <div className="absolute inset-0 py-1 px-4 sm:px-6">
                        {/* <div className="flex flex-wrap items-center">
                          {data.labels?.split(",").map((tag, index) => (
                            <div className="mx-1 h-6 text-xs mt-2 bg-slate-200 rounded-md flex justify-center items-center px-2 py-1">
                              {tag}
                            </div>
                          ))}
                        </div>

                        <div className="border-t mt-3 border-gray-300"></div> */}

                        {/* <div className="bg-slate-100 rounded-md py-3 px-3 my-2">
                          <div className="text-xs font-bold text-gray-700 ">
                            Message
                          </div>
                          <div className="text-xs text-gray-600 ">
                            Exception in channel pipeline
                          </div>
                        </div> */}

                        <div className="border-y border-gray-300 grid md:grid-cols-2">
                          {Object.keys(data).map((field) => (
                            <div className="ml-2 py-3 border-gray-300">
                              <div className="text-xs font-bold text-gray-700 ">
                                {field}
                              </div>
                              <div className="text-xs text-gray-600 ">
                                {isJsonString(data[field])
                                  ? JSON.stringify(
                                      JSON.parse(data[field]),
                                      null,
                                      2,
                                    )
                                  : data[field]}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2">
                          <div className="text-xs font-bold text-gray-700 ">
                            Logger Message
                          </div>
                          {/* <div className="text-xs text-gray-600 ">
                            Sakjdha askdjahd akjhda sk ajdhas kdaskdha skajhd
                            asakjh
                          </div> */}

                          <div className="bg-codeBack p-1 mt-5">
                            <div className="bg-codeBack h-500 scrollbar-thin  scrollbar-thumb-white scrollbar-codeBlack overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full py-3 px-3">
                              <div>
                                <pre className="text-white text-xs font-light">
                                  {JSON.stringify(data, null, 2)}
                                </pre>
                                {/* <pre className="text-white text-xs font-light">
                                  {data.log}
                                </pre>
                                <pre className="text-white text-xs font-light">
                                  {str}
                                </pre> */}
                                {/* <pre className="text-white text-xs font-light">
                                  {JSON.stringify(
                                    JSON.parse(`${data?.log}`),
                                    null,
                                    2
                                  )}
                                </pre> */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
