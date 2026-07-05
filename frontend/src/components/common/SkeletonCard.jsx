const SkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
          <div className="skeleton h-3 w-full rounded mb-1.5" />
          <div className="skeleton h-3 w-2/3 rounded mb-4" />
          <div className="flex items-center gap-2">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="skeleton h-5 w-14 rounded-full ml-auto" />
          </div>
        </div>
      ))}
    </>
  );
};

export const SkeletonStat = ({ count = 4 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-5 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton h-6 w-12 rounded" />
        </div>
        <div className="skeleton h-3 w-20 rounded mb-1" />
        <div className="skeleton h-7 w-12 rounded" />
      </div>
    ))}
  </div>
);

export default SkeletonCard;
