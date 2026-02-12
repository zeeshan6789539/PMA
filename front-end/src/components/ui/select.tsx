import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    options: { id: string | number; name: string;[key: string]: unknown }[]
    placeholder?: string
    error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, options, placeholder, id, error, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={id}
                        className={cn(
                            "flex h-12 w-full rounded-lg border-2 border-input bg-background/50 px-4 py-2 text-sm appearance-none cursor-pointer",
                            "ring-offset-background transition-all duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary",
                            "hover:border-primary/50 hover:bg-background/70",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "text-foreground",
                            error && "border-destructive focus-visible:ring-destructive",
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                </div>
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }
