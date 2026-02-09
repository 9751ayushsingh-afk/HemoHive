import { motion, Variants } from 'framer-motion';
import React from 'react';

interface AnimatedTextProps {
  text: string;
  el?: React.ElementType;
  className?: string;
}

const AnimatedText = ({ text, el: Wrapper = 'p', className }: AnimatedTextProps) => {
  const reveal: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <Wrapper className={className}>
      <motion.span
        variants={reveal}
        initial="hidden"
        animate="visible"
        style={{ display: 'inline-block' }}
      >
        {text}
      </motion.span>
    </Wrapper>
  );
};

export default AnimatedText;