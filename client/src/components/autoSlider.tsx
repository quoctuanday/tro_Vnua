import React, { useEffect, useRef, useState } from 'react';

interface AutoSliderProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    itemWidth?: number;
    speed?: number;
}

export default function AutoSlider<T>({
    items,
    renderItem,
    itemWidth = 280,
    speed = 10,
}: AutoSliderProps<T>): JSX.Element {
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const sliderElement = sliderRef.current;

        if (!sliderElement) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(sliderElement);

        return () => {
            observer.unobserve(sliderElement);
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const slider = sliderRef.current;
        if (!slider) return;

        let scrollInterval: NodeJS.Timeout;

        const startAutoSlide = () => {
            const maxScroll = slider.scrollWidth / 2;
            scrollInterval = setInterval(() => {
                if (slider.scrollLeft >= maxScroll) {
                    slider.scrollLeft = 0;
                } else {
                    slider.scrollLeft += 1;
                }
            }, speed);
        };

        const stopAutoSlide = () => clearInterval(scrollInterval);

        startAutoSlide();

        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);

        return () => {
            clearInterval(scrollInterval);
            slider.removeEventListener('mouseenter', stopAutoSlide);
            slider.removeEventListener('mouseleave', startAutoSlide);
        };
    }, [isVisible, speed]);

    const duplicatedItems = [...items, ...items];

    return (
        <div
            className="flex overflow-x-hidden space-x-4"
            ref={sliderRef}
            style={{ scrollBehavior: 'smooth' }}
        >
            {duplicatedItems.map((item, index) => (
                <div
                    key={index}
                    className="flex-shrink-0"
                    style={{ width: `${itemWidth}px` }}
                >
                    {renderItem(item, index)}
                </div>
            ))}
        </div>
    );
}
