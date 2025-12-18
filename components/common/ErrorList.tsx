import React from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/common/Button";

type ErrorListProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

const ErrorList: React.FC<ErrorListProps> = ({
  title = "Không thể tải dữ liệu",
  description = "Đã xảy ra lỗi khi tải danh sách. Vui lòng thử lại.",
  onRetry,
  retryLabel = "Thử lại",
  className = "",
}) => {
  return (
    <div className={`w-full bg-white rounded-2xl ring-1 ring-gray-200/70 shadow-sm p-8 ${className}`}>
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        {onRetry && (
          <div className="pt-2">
            <Button onClick={onRetry} variant="secondary" className="px-4 py-2">
              {retryLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorList;

