import { Button } from '@/components/ui/button';
import React from 'react';

type ActionButton = {
    label: string;
    onClick: () => void;
    className?: string;
};

interface ActionsColumnProps {
    onDelete?: () => void;
    onEdit?: () => void;
    actions?: ('edit' | 'delete')[] | 'all' | 'none' | ActionButton[];
    children?: React.ReactNode;
}

const ActionsColumn: React.FC<ActionsColumnProps> = ({ 
    onEdit, 
    onDelete, 
    actions = 'all', // Default is already 'all', no need to specify it when using the component
    children
}) => {
    // Helper function to check if an action should be visible
    const isActionVisible = (action: 'edit' | 'delete'): boolean => {
        if (actions === 'none') return false;
        if (actions === 'all') return true;
        if (Array.isArray(actions) && typeof actions[0] === 'string') {
            return (actions as ('edit' | 'delete')[]).includes(action);
        }
        return false;
    };

    // Render custom action buttons if provided
    const renderCustomActions = () => {
        if (!Array.isArray(actions) || typeof actions[0] === 'string') {
            return null;
        }
        
        return (actions as ActionButton[]).map((action, index) => (
            <Button 
                key={index}
                onClick={action.onClick} 
                type="button" 
                variant="ghost" 
                className={`text-sm h-7 !px-2 !py-1 hover:bg-gray-50 dark:hover:bg-gray-700 ${action.className || 'text-primary hover:text-primary/90'}`}
            >
                {action.label}
            </Button>
        ));
    };

    return (
        <div className="flex gap-1 items-center justify-center h-full">
            {children}
            {Array.isArray(actions) && typeof actions[0] !== 'string' ? (
                // Render custom action buttons
                renderCustomActions()
            ) : (
                // Render default edit and delete buttons
                <>
                    {isActionVisible('edit') && onEdit && (
                        <Button 
                            onClick={onEdit} 
                            type="button" 
                            variant="ghost" 
                            className="text-sm h-7 text-primary hover:text-primary/90 !px-2 !py-1 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Edit
                        </Button>
                    )}
                    {isActionVisible('delete') && onDelete && (
                        <Button 
                            onClick={onDelete} 
                            type="button" 
                            variant="ghost" 
                            className="text-sm h-7 text-destructive hover:text-destructive !px-2 !py-1 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Delete
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};

export default ActionsColumn;