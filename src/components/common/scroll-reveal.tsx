"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

type RevealDirection =
    | "up"
    | "left"
    | "right";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    direction?: RevealDirection;
    delay?: number;
}

export function ScrollReveal({
    children,
    className = "",
    direction = "up",
    delay = 0,
}: ScrollRevealProps) {
    const elementRef =
        useRef<HTMLDivElement | null>(null);

    const [isVisible, setIsVisible] =
        useState(false);

    useEffect(() => {
        const element = elementRef.current;

        if (!element) {
            return;
        }

        const prefersReducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;

        if (prefersReducedMotion) {
            const frame = requestAnimationFrame(() => {
                setIsVisible(true);
            });

            return () => {
                cancelAnimationFrame(frame);
            };
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    return;
                }

                setIsVisible(true);

                observer.unobserve(entry.target);
            },
            {
                threshold: 0.15,
                rootMargin: "0px 0px -10% 0px",
            },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    const hiddenTransform: Record<
        RevealDirection,
        string
    > = {
        up: "translate3d(0, 32px, 0)",
        left: "translate3d(-40px, 0, 0)",
        right: "translate3d(40px, 0, 0)",
    };

    return (
        <div
            ref={elementRef}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,

                transform: isVisible
                    ? "translate3d(0, 0, 0)"
                    : hiddenTransform[direction],

                transitionProperty:
                    "opacity, transform",

                transitionDuration: "700ms",

                transitionTimingFunction:
                    "cubic-bezier(0.22, 1, 0.36, 1)",

                transitionDelay: `${delay}ms`,

                willChange: isVisible
                    ? "auto"
                    : "opacity, transform",
            }}
        >
            {children}
        </div>
    );
}