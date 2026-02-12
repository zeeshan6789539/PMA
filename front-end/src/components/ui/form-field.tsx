import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input, type InputProps } from "@/components/ui/input"
import { ToggleButton } from "@/components/ui/toggle-button"
import { Select } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"

export type FieldType = 'text' | 'email' | 'password' | 'number' | 'toggle' | 'select' | 'textarea'

export interface FormFieldProps {
    label: string
    htmlFor?: string
    inputProps: any // Changed to any to handle various prop types more flexibly
    className?: string
    labelClassName?: string
    error?: string
    fieldType?: FieldType
    showPasswordToggle?: boolean
    showPassword?: boolean
    onTogglePassword?: () => void
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
                            {...inputProps}
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
                            <Select
                                id={htmlFor}
                                options={inputProps.options}
                                placeholder={inputProps.placeholder}
                                value={inputProps.value} // Crucial: pass the current value
                                onChange={(value) => {
                                    if (inputProps.onChange) {
                                        // Create a synthetic event or call the handler directly
                                        inputProps.onChange(value);
                                    }
                                }}
                                disabled={inputProps.disabled}
                                className={inputProps.className}
                                error={error}
                            />
                        ) : (
                            <div className="relative">
                                <Input
                                    id={htmlFor}
                                    ref={ref}
                                    {...inputProps}
                                    className={cn(inputClassName, inputProps.className)}
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