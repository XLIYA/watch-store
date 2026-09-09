"use client";

import { useEffect, useState } from "react";

interface LandingRevealProps {
    children: React.ReactNode;
}

export function LandingReveal({
    children,
}: LandingRevealProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setIsVisible(true);
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div
            className={`transition-opacity duration-700 ease-out ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
            {children}
        </div>
    );
}