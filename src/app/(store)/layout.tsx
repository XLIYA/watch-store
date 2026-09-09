import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

interface StoreLayoutProps {
    children: React.ReactNode;
}

export default function StoreLayout({
    children,
}: StoreLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />

            <div className="flex-1">
                {children}
            </div>

            <SiteFooter />
        </div>
    );
}