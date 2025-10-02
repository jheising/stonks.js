import React from "react";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = React.memo(({ currentPage, totalItems, pageSize, onPageChange, onPageSizeChange, pageSizeOptions = [25, 50, 100, 250] }) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getVisiblePages = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page: number | string) => {
        if (typeof page === "number" && page !== currentPage) {
            onPageChange(page);
        }
    };

    if (totalItems === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-tuna-800 border-t border-tuna-600">
            {/* Items info and page size selector */}
            <div className="flex items-center space-x-4">
                <div className="text-sm text-tuna-300">
                    Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span>{" "}
                    results
                </div>

                <div className="flex items-center space-x-2">
                    <label htmlFor="pageSize" className="text-sm text-tuna-300">
                        Show:
                    </label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={e => onPageSizeChange(Number(e.target.value))}
                        className="px-2 py-1 text-sm bg-tuna-700 border border-tuna-600 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-tuna-300">per page</span>
                </div>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-1">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-tuna-300 bg-tuna-700 border border-tuna-600 rounded-l-md hover:bg-tuna-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-tuna-700"
                >
                    Previous
                </button>

                {getVisiblePages().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === "..." ? (
                            <span className="px-3 py-2 text-sm text-tuna-400">...</span>
                        ) : (
                            <button
                                onClick={() => handlePageClick(page)}
                                className={`px-3 py-2 text-sm font-medium border ${
                                    page === currentPage ? "bg-teal-600 text-tuna-100 border-teal-600" : "text-tuna-300 bg-tuna-700 border-tuna-600 hover:bg-tuna-600"
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-tuna-300 bg-tuna-700 border border-tuna-600 rounded-r-md hover:bg-tuna-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-tuna-700"
                >
                    Next
                </button>
            </div>
        </div>
    );
});

Pagination.displayName = "Pagination";
