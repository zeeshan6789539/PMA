import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
    return (
        <nav className={`flex items-center text-sm ${className}`}>
            <ol className="flex items-center">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                            )}
                            {isLast || !item.href ? (
                                <span
                                    className={
                                        isLast
                                            ? "font-medium text-foreground"
                                            : "text-muted-foreground"
                                    }
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.href}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
