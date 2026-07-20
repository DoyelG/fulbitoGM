type PaginationButtonProps = {
  page: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export const PaginationButton = ({
  page,
  currentPage,
  onPageChange,
}: PaginationButtonProps) => {
  const isActive = page === currentPage;

  return (
    <button
      onClick={() => onPageChange(page)}
      aria-current={isActive ? "page" : undefined}
      className={`min-w-9 px-3 py-1.5 rounded border text-sm transition-colors ${
        isActive
          ? "bg-indigo-600 text-white border-indigo-600"
          : "hover:bg-gray-50"
      }`}
    >
      {page}
    </button>
  );
};