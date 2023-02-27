/* This example requires Tailwind CSS v2.0+ */
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/20/solid";
import { useMemo, useRef, useState } from "react";
import PageNumber from "../components/page-number";

type PaginationProps = {
  defaultPage?: number;
  numberOfPages: number | undefined;
  onPageChange: (pageNumber: number) => void;
};

export default function Pagination({
  defaultPage = 1,
  numberOfPages = 1,
  onPageChange,
}: PaginationProps) {
  const numOfPages = useRef(Array(numberOfPages).fill(0));
  const [currentPage, setCurrentPage] = useState(defaultPage);
  function handleSelectPage(page: number): void {
    handlePageChange(page);
    setCurrentPage(page);
  }

  const getVisiblePages = useMemo(() => {
    const pages = Array.from(
      { length: numOfPages.current.length },
      (_, i) => i + 1
    );
    if (pages.length <= 7) {
      return pages;
    }

    const PAGES_TO_DISPLAY = 6;
    const [LOWER_BOUNDARY, UPPER_BOUNDARY] =
      PAGES_TO_DISPLAY % 2 === 0
        ? [PAGES_TO_DISPLAY / 2, PAGES_TO_DISPLAY / 2 + 1]
        : [
            Math.floor(PAGES_TO_DISPLAY / 2) - 1,
            Math.ceil(PAGES_TO_DISPLAY / 2),
          ];

    const index = currentPage - 1;

    if (index < PAGES_TO_DISPLAY) {
      return [
        ...pages.slice(0, PAGES_TO_DISPLAY + 2),
        -1,
        pages[pages.length - 1],
      ];
    }

    if (index > pages.length - (PAGES_TO_DISPLAY + 1)) {
      return [
        pages[0],
        -2,
        ...pages.slice(pages.length - (PAGES_TO_DISPLAY + 2)),
      ];
    }

    return [
      pages[0],
      -1,
      ...pages.slice(
        index - (LOWER_BOUNDARY > 0 ? LOWER_BOUNDARY : 1),
        index + UPPER_BOUNDARY
      ),
      -2,
      pages[pages.length - 1],
    ];
  }, [currentPage]);
  const handleArrowClick = (index: number) => {
    setCurrentPage((page) => {
      if (page + index === 0 || page + index > numOfPages.current.length)
        return page;

      handlePageChange(page + index);
      return page + index;
    });
  };
  const handlePageChange = (page: number) => {
    onPageChange(page);
  };
  return (
    <nav className="flex items-center justify-between px-4 sm:px-0">
      <div className="-mt-px flex w-0 flex-1">
        <div
          onClick={() => handleArrowClick(-1)}
          className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        >
          <ArrowLongLeftIcon
            className="mr-3 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="-mt-px flex transition-all duration-300 ">
        {getVisiblePages.map((page = -1) => (
          <PageNumber
            key={page}
            pageNumber={page}
            selected={page === currentPage}
            onClick={handleSelectPage}
            onEllipsisClick={() => console.log("asdf")}
          />
        ))}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <div
          onClick={() => handleArrowClick(1)}
          className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
        >
          <ArrowLongRightIcon
            className="ml-3 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
      </div>
    </nav>
  );
}
