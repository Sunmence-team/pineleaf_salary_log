import React from 'react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const PaginationControls = ({ currentPage, totalPages, setCurrentPage } : { currentPage:number, totalPages:number, setCurrentPage: React.Dispatch<React.SetStateAction<number>> }) => {

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 3; // Number of page buttons to show (excluding ellipsis and ends)
        const boundaryPages = 1; // Number of pages to show at the start and end

        if (totalPages <= maxPagesToShow + (boundaryPages * 2) -2) { // Adjusted condition for simpler display
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show the first page
            pages.push(1);

            // Determine the range for middle pages
            let startMiddle = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
            let endMiddle = Math.min(totalPages - 1, currentPage + Math.ceil(maxPagesToShow / 2) - 1);

            // Adjust range if current page is near the start
            if (currentPage <= boundaryPages + Math.floor(maxPagesToShow / 2)) {
                startMiddle = 2;
                endMiddle = maxPagesToShow;
            }
            // Adjust range if current page is near the end
            if (currentPage >= totalPages - boundaryPages - Math.floor(maxPagesToShow / 2) +1) {
                endMiddle = totalPages - 1;
                startMiddle = totalPages - maxPagesToShow +1;
            }


            // Add leading ellipsis if needed
            if (startMiddle > 2) {
                pages.push("...");
            }

            // Add middle pages
            for (let i = startMiddle; i <= endMiddle; i++) {
                pages.push(i);
            }

            // Add trailing ellipsis if needed
            if (endMiddle < totalPages - 1) {
                pages.push("...");
            }

            // Always show the last page if there's more than one page and it's not already in pages
            if (totalPages > 1 && !pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const displayedPageNumbers = getPageNumbers();

    if (totalPages <= 1) {
        return null; // Don't render pagination if there's only one page or no pages
    }

    return (
        <div className="flex justify-center items-center gap-1">
            <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                className="px-3 py-2.5 opacity-100 rounded-md hover:bg-pryClr/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-25"
            >
                <MdKeyboardArrowLeft />
            </button>
            <span className="font-medium flex items-center gap-1">
                {displayedPageNumbers.map((page, index) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-1 text-gray-500"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`px-3 py-1 rounded-md cursor-pointer transition-all duration-200 ${
                                currentPage === page
                                    ? "bg-pryClr text-white"
                                    : "bg-transparent hover:bg-pryClr/20"
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}
            </span>
            <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                className="px-3 py-2.5 opacity-100 rounded-md hover:bg-pryClr/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-25"
            >
                <MdKeyboardArrowRight />
            </button>
        </div>
    );
};

export default PaginationControls;