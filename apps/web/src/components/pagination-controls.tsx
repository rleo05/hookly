'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: string) => void;
  sizeOptions?: string[];
}

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onSizeChange,
  sizeOptions = ['5', '10', '20', '50', '100'],
}: PaginationControlsProps) {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handlePageInputBlur = () => {
    if (!inputPage) {
      setInputPage(currentPage.toString());
      return;
    }

    const newPage = parseInt(inputPage, 10);

    if (isNaN(newPage)) {
      setInputPage(currentPage.toString());
      return;
    }

    let validatedPage = newPage;
    if (newPage < 1) {
      validatedPage = 1;
    } else if (newPage > totalPages) {
      validatedPage = totalPages;
    }

    if (validatedPage !== currentPage) {
      onPageChange(validatedPage);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="flex items-center justify-between mt-6 gap-4 flex-wrap">
      <span className="text-sm text-text-muted whitespace-nowrap">Total: {totalItems} items</span>

      <div className="flex items-center gap-4 flex-wrap justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted whitespace-nowrap">Rows per page:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onSizeChange(e.target.value)}
              className="appearance-none bg-muted-bg border border-border text-text-main text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-primary cursor-pointer"
            >
              {sizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-text-muted whitespace-nowrap">
            <span>Page</span>
            {totalPages > 1 ? (
              <input
                type="text"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onBlur={handlePageInputBlur}
                onKeyDown={handlePageInputKeyDown}
                className="w-12 p-1 text-center rounded-md border border-border bg-muted-bg text-text-main focus:outline-none focus:border-primary transition-colors"
              />
            ) : (
              <span>{currentPage}</span>
            )}
            <span>of {totalPages}</span>
          </div>

          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-lg border border-border text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-bg transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-lg border border-border text-text-main disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted-bg transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
