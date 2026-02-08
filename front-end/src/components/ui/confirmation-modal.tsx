import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface ConfirmationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
    variant?: "default" | "destructive"
    className?: string
}

const ConfirmationModal = ({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    variant = "destructive",
    className,
}: ConfirmationModalProps) => {
    const handleConfirm = () => {
        onConfirm()
        onOpenChange(false)
    }

    const handleCancel = () => {
        onCancel?.()
        onOpenChange(false)
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleCancel}
            />

            {/* Modal content */}
            <div
                className={cn(
                    "relative z-50 w-full max-w-md rounded-lg bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 duration-200",
                    className
                )}
            >
                {/* Close button */}
                <button
                    onClick={handleCancel}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>

                {/* Modal header */}
                <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                    <h2 className="text-lg font-semibold leading-none tracking-tight">
                        {title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>

                {/* Modal footer */}
                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export { ConfirmationModal }
