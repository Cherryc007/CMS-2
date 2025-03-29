export default function SectionLoading() {
  return (
    <div className="w-full py-20 flex justify-center items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse w-12 h-12 bg-blue-200 dark:bg-blue-900 rounded-full"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
} 