import React from 'react';
import { Skeleton } from '../ui/skeleton';

const TableSkeleton: React.FC = () => {
    const xsNumber = 5;
    const smNumber = 5;
    const mdNumber = 15;
    return (
        <>
            <div>
                <div className="flex justify-between items-center border-b dark:border-gray-600 p-3 h-[61px]">
                    <div className="flex space-x-2 gap-4">
                        <Skeleton className="h-8 w-[90px]" />
                        <Skeleton className="h-8 w-[230px]" />
                        <Skeleton className="h-8 w-[100px]" />
                        <Skeleton className="h-8 w-[100px]" />
                        <Skeleton className="h-8 w-[100px]" />
                        <Skeleton className="h-8 w-[100px]" />
                    </div>
                    <div className="flex items-center gap-2 mr-2">
                        <Skeleton className="h-8 w-[84px]" />
                        <Skeleton className="h-8 w-[103px]" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4">
                    {Array.from({ length: xsNumber }).map((_, index) => (
                        <Skeleton key={index} className="w-full h-[30px] rounded bg-gray-100 dark:bg-gray-700" />
                    ))}
                    {Array.from({ length: smNumber }).map((_, index) => (
                        <Skeleton key={index} className="w-full h-[30px] rounded bg-gray-100 dark:bg-gray-700 hidden sm:block" />
                    ))}
                    {Array.from({ length: mdNumber }).map((_, index) => (
                        <Skeleton key={index} className="w-full h-[30px] rounded bg-gray-100 dark:bg-gray-700 hidden md:block" />
                    ))}
                </div>
            </div>
        </>
    );
};

export default TableSkeleton;