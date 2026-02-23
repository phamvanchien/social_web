import Skeleton from "@/components/common/Skeleton";

const PostCardLoading = () => {
  return (
    <article className="bg-white dark:bg-gray-900 rounded-2xl ring-1 ring-gray-200/70 dark:ring-gray-700/70 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between px-4 pt-3 pb-2">
        <div className="flex gap-3">
          <Skeleton className="w-10 h-10" rounded="full" />
          <div>
            <Skeleton className="h-4 w-40 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="px-4 pb-3">
        <Skeleton className="h-4 w-11/12 mb-2" />
        <Skeleton className="h-4 w-8/12" />
      </div>
      <div className="bg-black/5 dark:bg-white/5">
        <div className="grid grid-cols-3 grid-rows-3 gap-1 h-[520px] bg-gray-100 dark:bg-gray-800">
          <div className="col-span-2 row-span-3">
            <Skeleton className="w-full h-full" />
          </div>
          <div>
            <Skeleton className="w-full h-full" />
          </div>
          <div>
            <Skeleton className="w-full h-full" />
          </div>
          <div>
            <Skeleton className="w-full h-full" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-start gap-8 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </article>
  )
}
export default PostCardLoading;
