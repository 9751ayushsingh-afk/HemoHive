"use client";

import { motion, useInView, Variants } from 'framer-motion';
import { useRef } from 'react';

interface TextRevealProps {
    text: string;
    el?: React.ElementType;
    className?: string;
    mode?: 'word' | 'char' | 'simple';
    delay?: number;
    duration?: number;
}

export const TextReveal = ({
    text,
    el: Wrapper = 'p',
    className,
    mode = 'word',
    delay = 0,
    duration = 0.8
}: TextRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: mode === 'char' ? 0.05 : 0.1,
                delayChildren: delay,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            filter: 'blur(10px)',
            scale: 1.05
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
                duration: duration,
                ease: [0.2, 0.65, 0.3, 0.9], // "Aesthetic" smooth easing
            },
        },
    };

    const words = text.split(" ");
    const chars = text.split("");

    return (
        <Wrapper ref={ref} className={className}>
            <motion.span
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                aria-hidden="true"
                style={{ display: 'inline-block' }}
            >
                {mode === 'word' && words.map((word, i) => (
                    <span key={i} className="inline-block whitespace-nowrap mr-[0.25em]">
                        <motion.span variants={itemVariants} className="inline-block">
                            {word}
                        </motion.span>
                    </span>
                ))}

                {mode === 'char' && chars.map((char, i) => (
                    <motion.span key={i} variants={itemVariants} className="inline-block whitespace-pre">
                        {char}
                    </motion.span>
                ))}

                {mode === 'simple' && (
                    <motion.span variants={itemVariants} className="inline-block">
                        {text}
                    </motion.span>
                )}
            </motion.span>
            <span className="sr-only">{text}</span>
        </Wrapper>
    );
};

export default TextReveal;
