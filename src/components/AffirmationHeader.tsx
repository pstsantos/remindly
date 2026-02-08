import { motion } from 'framer-motion';
import { AFFIRMATIONS } from '@/types/fixation';
import { useMemo } from 'react';

export function AffirmationHeader() {
  const affirmation = useMemo(() => {
    const weekIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return AFFIRMATIONS[weekIndex % AFFIRMATIONS.length];
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="px-6 pt-10 pb-4"
    >
      <h1 className="text-4xl md:text-5xl leading-tight tracking-tight text-foreground">
        {affirmation}
      </h1>
    </motion.div>
  );
}
