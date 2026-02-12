import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"

export interface CustomSelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    label?: string
    options: { id: string | number; name: string }[]
    placeholder?: string
    value?: string | number
    onChange?: (value: string | number) => void | ((e: React.ChangeEvent<HTMLSelectElement>) => void)
    disabled?: boolean
    error?: string
    id?: string
    name?: string
}

export const CustomSelect = React.forwardRef<HTMLDivElement, CustomSelectProps>(
    ({
        label,
        options,
        placeholder = "Select an option",
        value,
        onChange,
        disabled = false,
        error,
        className,
        id,
        name,
        ...props
    }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false)
        const containerRef = React.useRef<HTMLDivElement>(null)

        const selectedOption = options.find(opt => opt.id === value)

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }

            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    setIsOpen(false)
                }
            }

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside)
                document.addEventListener('keydown', handleEscape)
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
                document.removeEventListener('keydown', handleEscape)
            }
        }, [isOpen])

        const handleSelect = (optionId: string | number) => {
            onChange?.(optionId)
            setIsOpen(false)
        }

        return (
            <div className={cn("space-y-2", className)}>
                {label && (
                    <label
                        htmlFor={id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        {label}
                    </label>
                )}
                <div ref={containerRef} className="relative">
                    <button
                        type="button"
                        id={id}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        disabled={disabled}
                        className={cn(
                            "flex h-12 w-full items-center justify-between rounded-lg border-2 border-input bg-background/50 px-4 py-2 text-sm",
                            "ring-offset-background transition-all duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary",
                            "hover:border-primary/50 hover:bg-background/70",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            error && "border-destructive focus-visible:ring-destructive",
                            !selectedOption && "text-muted-foreground"
                        )}
                    >
                        <span>{selectedOption ? selectedOption.name : placeholder}</span>
                        <ChevronDown
                            className={cn(
                                "h-5 w-5 text-muted-foreground transition-transform duration-300",
                                isOpen && "rotate-180"
                            )}
                        />
                    </button>

                    {isOpen && (
                        <div className="absolute z-50 mt-2 w-full glass-card border-2 border-primary/30 rounded-xl shadow-2xl shadow-primary/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="max-h-60 overflow-y-auto p-1">
                                {options.map((option) => {
                                    const isSelected = option.id === value
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => handleSelect(option.id)}
                                            className={cn(
                                                "flex w-full items-center justify-between px-4 py-3 text-sm rounded-lg transition-all duration-200",
                                                "hover:bg-primary hover:text-primary-foreground",
                                                isSelected && "bg-primary text-primary-foreground font-medium"
                                            )}
                                        >
                                            <span>{option.name}</span>
                                            {isSelected && <Check className="h-4 w-4" />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
            </div>
        )
    }
)
CustomSelect.displayName = "CustomSelect"
