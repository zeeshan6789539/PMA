import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input, type InputProps } from "@/components/ui/input"
import { ToggleButton } from "@/components/ui/toggle-button"
import { CustomSelect } from "@/components/ui/custom-select"
import { Eye, EyeOff } from "lucide-react"

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'toggle' | 'select' | 'textarea'

export interface FormFieldProps {
    label: string
    htmlFor?: string
    inputProps: InputProps | ToggleButtonProps | SelectProps
    className?: string
    labelClassName?: string
    error?: string
    fieldType?: FieldType
    showPasswordToggle?: boolean
    showPassword?: boolean
    onTogglePassword?: () => void
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
    ({ label, htmlFor, inputProps, className, labelClassName, error, fieldType = 'text', showPasswordToggle, showPassword, onTogglePassword, ...props }, ref) => {
        const isToggle = fieldType === 'toggle'
        const isSelect = fieldType === 'select'
        const inputClassName = showPasswordToggle ? "[&_input]:pr-10" : ""

        return (
            <div className={cn(isToggle ? "" : "space-y-2", className)} {...props}>
                {isToggle ? (
                    <div className="flex items-center justify-between py-2">
                        <Label
                            htmlFor={htmlFor}
                            className={cn("text-base font-medium", labelClassName)}
                        >
                            {label}
                        </Label>
                        <ToggleButton
                            {...(inputProps as ToggleButtonProps)}
                        />
                    </div>
                ) : (
                    <>
                        <Label
                            htmlFor={htmlFor}
                            className={labelClassName}
                        >
                            {label}
                        </Label>
                        {isSelect ? (
                            <CustomSelect
                                id={htmlFor}
                                options={(inputProps as SelectProps).options}
                                placeholder={(inputProps as SelectProps).placeholder}
                                value={(inputProps as SelectProps).value}
                                onChange={(value) => {
                                    const selectProps = inputProps as SelectProps;
                                    if (selectProps.onChange) {
                                        // Create a synthetic event for react-hook-form
                                        const syntheticEvent = {
                                            target: { value: String(value) }
                                        } as React.ChangeEvent<HTMLSelectElement>;
                                        selectProps.onChange(syntheticEvent);
                                    }
                                }}
                                disabled={(inputProps as SelectProps).disabled}
                                className={(inputProps as SelectProps).className}
                            />
                        ) : (
                            <div className="relative">
                                <Input
                                    id={htmlFor}
                                    ref={ref}
                                    {...(inputProps as InputProps)}
                                    className={cn(inputClassName, (inputProps as InputProps).className)}
                                />
                                {showPasswordToggle && (
                                    <button
                                        type="button"
                                        onClick={onTogglePassword}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
            </div>
        )
    }
)
FormField.displayName = "FormField"

export { FormField }
