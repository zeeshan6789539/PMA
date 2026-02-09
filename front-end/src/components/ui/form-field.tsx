import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input, type InputProps } from "@/components/ui/input"
import { ToggleButton } from "@/components/ui/toggle-button"
import { Select } from "@/components/ui/select"

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'toggle' | 'select' | 'textarea'

export interface FormFieldProps {
    label: string
    htmlFor?: string
    inputProps: InputProps | ToggleButtonProps | SelectProps
    className?: string
    labelClassName?: string
    error?: string
    fieldType?: FieldType
}

interface ToggleButtonProps {
    isActive: boolean
    onClick: () => void
    label?: string
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    className?: string
    activeClassName?: string
    inactiveClassName?: string
}

interface SelectProps {
    value?: string | number
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: { id: string | number; name: string; }[]
    placeholder?: string
    disabled?: boolean
    className?: string
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, htmlFor, inputProps, className, labelClassName, error, fieldType = 'text', ...props }, ref) => {
        const isToggle = fieldType === 'toggle'
        const isSelect = fieldType === 'select'
        return (
            <div className={cn("space-y-2", className)} {...props}>
                <Label
                    htmlFor={htmlFor}
                    className={labelClassName}
                >
                    {label}
                </Label>
                {isToggle ? (
                    <ToggleButton
                        {...(inputProps as ToggleButtonProps)}
                    />
                ) : isSelect ? (
                    <Select
                        id={htmlFor}
                        {...(inputProps as SelectProps)}
                    />
                ) : (
                    <Input
                        id={htmlFor}
                        ref={ref}
                        {...(inputProps as InputProps)}
                    />
                )}
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)
FormField.displayName = "FormField"

export { FormField }
