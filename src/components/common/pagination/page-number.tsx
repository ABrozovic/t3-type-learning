import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useRef, useState } from "react";

type PageNumberProps = {
  pageNumber: number;
  selected: boolean;
  onClick: (number: number) => void;
  onEllipsisClick: () => void;
};
function PageNumber({
  pageNumber,
  selected,
  onClick,
  onEllipsisClick,
}: PageNumberProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    if (pageNumber < 0) {
      onEllipsisClick();
    } else {
      onClick(pageNumber);
    }
  };

  const handleInputSubmit = () => {
    onClick(parseInt(inputValue));
    setInputValue("");
    setShowInput(false);
  };

  return (
    <Fragment>
      <Transition.Root show={showInput} as={Fragment}>
        <div className="z-10">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 h-screen w-screen "
              onClick={() => setShowInput(false)}
            />
          </Transition.Child>
          <Transition.Child
            as="div"
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <div className="absolute ml-1 w-20 -translate-y-9 -translate-x-1/2 transform rounded border border-lime-500">
              <div
                onClick={() => inputRef.current?.focus()}
                className="absolute bottom-[-6px] left-1/2 ml-[2px] -mt-4 -translate-x-1/2 transform"
              >
                <div className="absolute bottom-0 left-1/2 h-3 w-3 rotate-45 transform border-b-2 border-r-2 border-lime-500 bg-white"></div>
              </div>
              <form onSubmit={handleInputSubmit}>
                <input
                  type="text"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full rounded-md border-gray-300  text-sm text-gray-900 shadow-sm focus:border-lime-500 focus:ring focus:ring-lime-500 focus:ring-opacity-50"
                />
              </form>
            </div>
          </Transition.Child>
        </div>
      </Transition.Root>

      <div
        onClick={handleClick}
        className={clsx(
          `text-md relative inline-flex min-w-[1.5rem]  cursor-pointer items-center justify-center border-t-2 pt-4 font-medium transition-all duration-200`,
          {
            "border-lime-500 px-4 pt-4  text-lime-600": selected,
            " border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-300":
              !selected,
          }
        )}
      >
        {pageNumber < 0 ? (
          <button
            className="px-2"
            onClick={() => {
              setShowInput(!showInput);
              inputRef.current?.focus();
            }}
          >
            ...
          </button>
        ) : (
          <div>{pageNumber}</div>
        )}
      </div>
    </Fragment>
  );
}

export default PageNumber;
