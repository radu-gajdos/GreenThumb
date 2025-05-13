import React from 'react';
import { Skeleton } from '../ui/skeleton';

const KanbanSkeleton: React.FC = () => {
    return (
        <>
            <div className="">
                <div className="flex justify-between items-center border-b dark:border-gray-600 p-3">
                  <div className="flex space-x-2 gap-4">
                    <Skeleton className="h-8 w-[90px]" />
                    <Skeleton className="h-8 w-[230px]" />
                  </div>
                  <div className="flex items-center gap-2 mr-2">
                    <Skeleton className="h-8 w-[84px]" />
                    <Skeleton className="h-8 w-[103px]" />
                  </div>
                </div>
                
                <div className="flex space-x-4 overflow-x-hidden p-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex-shrink-0 bg-muted-50 dark:bg-[#1f2937] rounded-xl min-w-[300px] h-[300px] py-3">
                      <div className="p-3">
                        <Skeleton className="h-5 w-25" />
                      </div>
                      <div className="p-3 space-y-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
            </div>
        </>
    );
};

export default KanbanSkeleton;