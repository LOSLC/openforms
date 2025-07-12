'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  siblingCount = 1,
}: PaginationProps) {
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    
    // Always show first page
    if (showFirstLast) {
      pages.push(1);
    }
    
    // Calculate range around current page
    const startPage = Math.max(showFirstLast ? 2 : 1, currentPage - siblingCount);
    const endPage = Math.min(showFirstLast ? totalPages - 1 : totalPages, currentPage + siblingCount);
    
    // Add ellipsis after first page if needed
    if (showFirstLast && startPage > 2) {
      pages.push('ellipsis');
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      if (!showFirstLast || (i !== 1 && i !== totalPages)) {
        pages.push(i);
      }
    }
    
    // Add ellipsis before last page if needed
    if (showFirstLast && endPage < totalPages - 1) {
      pages.push('ellipsis');
    }
    
    // Always show last page
    if (showFirstLast && totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pages = generatePageNumbers();

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* Previous button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {/* Page numbers */}
      {pages.map((page, index) => (
        <div key={index}>
          {page === 'ellipsis' ? (
            <div className="flex h-8 w-8 items-center justify-center">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          )}
        </div>
      ))}

      {/* Next button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}

interface PaginationInfoProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export function PaginationInfo({ currentPage, itemsPerPage, totalItems }: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No items found
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      Showing {startItem} to {endItem} of {totalItems} items
    </p>
  );
}
