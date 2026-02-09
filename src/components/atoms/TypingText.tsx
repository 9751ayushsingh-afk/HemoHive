"use client";

import { useState, useEffect } from 'react';

const TypingText = ({ text, className = "" }: { text: string, className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (isTyping) {
      if (displayedText.length < text.length) {
        const timeoutId = setTimeout(() => {
          setDisplayedText(text.substring(0, displayedText.length + 1));
        }, 100); // Adjust typing speed here
        return () => clearTimeout(timeoutId);
      } else {
        setIsTyping(false);
      }
    }
  }, [displayedText, isTyping, text]);

  return <p className={className}>{displayedText}</p>;
};

export default TypingText;
