interface StoreLayoutProps {
    children: React.ReactNode;
}

export default function StoreLayout({
    children,
}: StoreLayoutProps) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}