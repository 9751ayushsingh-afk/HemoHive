import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

const pages = [
    {
        src: '/image1.png',
        title: 'The Shortage',
        description: 'Every 2 seconds, someone in India needs blood.',
        color: 'from-red-900/40 to-black',
        accent: 'text-red-500'
    },
    {
        src: '/image2.png',
        title: 'The Gap',
        description: '12 million units needed. Only 10 million collected.',
        color: 'from-purple-900/40 to-black',
        accent: 'text-purple-500'
    },
    {
        src: '/image3.png',
        title: 'The Impact',
        description: 'Blood shortage turns treatable emergencies into fatal outcomes.',
        color: 'from-blue-900/40 to-black',
        accent: 'text-blue-500'
    },
    {
        src: '/image4.png',
        title: 'The Solution',
        description: 'Your one donation can save up to 3 lives.',
        color: 'from-emerald-900/40 to-black',
        accent: 'text-emerald-500'
    },
];

const StickyScrollReveal = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"],
    });

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-neutral-950">
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
                {pages.map((page, i) => (
                    <RevealLayer
                        key={i}
                        page={page}
                        index={i}
                        progress={scrollYProgress}
                        total={pages.length}
                    />
                ))}

                <ProgressBar progress={scrollYProgress} />

                {/* Global Overlay Vignette */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-40" />
            </div>
        </section>
    );
};

const RevealLayer = ({
    page,
    index,
    progress,
    total
}: {
    page: typeof pages[0];
    index: number;
    progress: MotionValue<number>;
    total: number;
}) => {
    const rangeStart = (index - 1) / (total - 1);
    const rangeEnd = index / (total - 1);

    const clipPath = useTransform(
        progress,
        [rangeStart, rangeEnd],
        index === 0 ? ["circle(150% at center)", "circle(150% at center)"] : ["circle(0% at center)", "circle(150% at center)"]
    );

    const scale = useTransform(
        progress,
        [rangeStart, rangeEnd],
        index === 0 ? [1, 1] : [1.2, 1]
    );

    const opacity = useTransform(
        progress,
        [rangeStart, rangeEnd],
        index === 0 ? [1, 1] : [0, 1]
    );

    return (
        <motion.div
            style={{
                clipPath,
                zIndex: index
            }}
            className="absolute inset-0 w-full h-full bg-black flex items-center justify-center"
        >
            {/* Background Image with Enhanced Saturation */}
            <motion.div
                style={{ scale }}
                className="absolute inset-0"
            >
                <img
                    src={page.src}
                    alt={page.title}
                    className="w-full h-full object-cover transition-all duration-700"
                    style={{ filter: 'saturate(1.4) contrast(1.2) brightness(0.75)' }}
                />

                {/* Dynamic Gradient Overlay based on content */}
                <div className={`absolute inset-0 bg-gradient-to-t ${page.color} z-10 opacity-80`} />

                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-20" />
            </motion.div>

            {/* Content Content */}
            <div className="relative z-30 text-center max-w-5xl px-6 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                    whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                >
                    <h2 className="text-7xl md:text-9xl font-black font-accent text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500 mb-4 uppercase tracking-tighter drop-shadow-2xl">
                        {page.title}
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="relative"
                >
                    {/* Decorative Line */}
                    <div className={`w-24 h-1 mx-auto mb-8 rounded-full bg-gradient-to-r from-transparent via-${page.accent.split('-')[1]}-500 to-transparent`} />

                    <p className="text-2xl md:text-4xl text-neutral-200 font-body font-light max-w-2xl leading-relaxed drop-shadow-lg">
                        {page.description}
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};

const ProgressBar = ({ progress }: { progress: MotionValue<number> }) => {
    return (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6 backdrop-blur-sm p-4 rounded-full bg-black/20 border border-white/5">
            {pages.map((page, i) => (
                <Indicator key={i} index={i} progress={progress} total={pages.length} color={page.accent} />
            ))}
        </div>
    );
};

const Indicator = ({ index, progress, total, color }: { index: number, progress: MotionValue<number>, total: number, color: string }) => {
    const rangeStart = index / (total - 1) - 0.1;
    const isActive = useTransform(progress, [rangeStart, rangeStart + 0.1], [0, 1]);

    // Create color string for inline style (hacky for Tailwind classes in framer motion style)
    // Actually better to use conditional class rendering or simple white -> accent transition

    return (
        <div className="relative w-3 h-3 flex items-center justify-center">
            <motion.div
                className={`w-full h-full rounded-full bg-neutral-600 transition-colors duration-500`}
            />
            <motion.div
                style={{ scale: isActive, opacity: isActive }}
                className={`absolute inset-0 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]`}
            />
        </div>
    );
};

export default StickyScrollReveal;
