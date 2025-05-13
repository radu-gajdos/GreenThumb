import React from 'react';
import { Skeleton } from '../ui/skeleton';

const ModalSkeleton: React.FC<{rows?: number; columns?: number;}> = ({rows = 6, columns = 2}) => {
    const smNumber = rows;
    const mdNumber = rows*(columns-1);
    return (
        <>
            <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4 p-4`}>
                {Array.from({ length: smNumber }).map((_, index) => (
                    <Skeleton key={index} className="w-full h-[40px] rounded bg-gray-100" />
                ))}
                {Array.from({ length: mdNumber }).map((_, index) => (
                    <Skeleton key={index} className="w-full h-[40px] rounded bg-gray-100 hidden sm:block" />
                ))}
            </div>
        </>
    );
};

export default ModalSkeleton;