import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

interface TooltipProps {
    content: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState<"top" | "bottom">("top");
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isVisible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;

            // Position tooltip below if not enough space above
            const newPosition = spaceAbove < 150 && spaceBelow > spaceAbove ? "bottom" : "top";
            setPosition(newPosition);

            // Calculate position relative to viewport
            const left = rect.left + rect.width / 2;
            const top = newPosition === "top" ? rect.top - 8 : rect.bottom + 8;

            setCoords({ top, left });
        }
    }, [isVisible]);

    const tooltipContent = isVisible ? (
        <div
            ref={tooltipRef}
            className="fixed z-[9999] px-3 py-2 text-sm text-white bg-tuna-800 border border-tuna-600 rounded-lg shadow-xl whitespace-normal max-w-xs"
            style={{
                width: "280px",
                top: position === "top" ? "auto" : `${coords.top}px`,
                bottom: position === "top" ? `${window.innerHeight - coords.top}px` : "auto",
                left: `${coords.left}px`,
                transform: "translateX(-50%)"
            }}
        >
            <div className="text-xs leading-relaxed space-y-1">{content}</div>
            {/* Arrow */}
            <div
                className={`absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-tuna-800 border-tuna-600 rotate-45 ${
                    position === "top" ? "bottom-[-5px] border-r border-b" : "top-[-5px] border-l border-t"
                }`}
            />
        </div>
    ) : null;

    return (
        <div className={`relative inline-flex items-center ${className}`} ref={triggerRef}>
            <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} className="inline-flex items-center">
                {children || <Info className="w-4 h-4 text-tuna-400 hover:text-tuna-300 transition-colors cursor-help" />}
            </div>

            {tooltipContent && createPortal(tooltipContent, document.body)}
        </div>
    );
};

interface InfoIconProps {
    tooltip: React.ReactNode;
    className?: string;
}

export const InfoIcon: React.FC<InfoIconProps> = ({ tooltip, className = "" }) => {
    return <Tooltip content={tooltip} className={className} />;
};
