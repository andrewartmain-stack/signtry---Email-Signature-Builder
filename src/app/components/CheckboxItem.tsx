import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface CheckboxItemProps {
    id: string;
    isChecked: boolean;
    onCheckedChange: (checked: boolean) => void;
    text: string;
    description?: string;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
    id,
    isChecked,
    onCheckedChange,
    text,
    description
}) => {
    return (
        <div className="flex items-center space-x-2">
            <Checkbox
                id={id}
                checked={isChecked}
                onCheckedChange={onCheckedChange}
                className="mt-0.5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <div>
                <label
                    htmlFor={id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    {text}
                </label>
                {description && (
                    <p className="text-sm text-gray-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}

export default CheckboxItem