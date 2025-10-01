import React from "react";
import { InfoIcon } from "./Tooltip";

interface MetricCardProps {
    title: string;
    tooltip?: React.ReactNode;
    footer?: string | React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, tooltip, footer, children, className = "" }) => {
    return (
        <div className={`bg-tuna-600 rounded-lg p-4 ${className}`}>
            <div className="text-sm text-tuna-300 mb-1 font-semibold flex items-center gap-1">
                <span className="uppercase">{title}</span>
                {tooltip && <InfoIcon tooltip={tooltip} />}
            </div>
            <div className="text-2xl font-semibold tracking-wide">{children}</div>
            {footer && <div className="text-xs text-tuna-300 mt-1 font-medium">{footer}</div>}
        </div>
    );
};
