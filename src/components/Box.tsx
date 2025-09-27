export const Box = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return <div className={`bg-tuna-800 rounded-2xl shadow-sm overflow-hidden px-6 py-4 ${className}`}>{children}</div>;
}