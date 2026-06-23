'use client'

import { motion, useReducedMotion, type Transition } from 'framer-motion'

/** Barely perceptible drift — long cycles, small travel, linear flow */
const drift = (
  x: [string, string, string],
  y: [string, string, string],
  duration: number,
  delay = 0,
): { animate: { x: string[]; y: string[] }; transition: Transition } => ({
  animate: { x, y },
  transition: {
    duration,
    delay,
    repeat: Infinity,
    repeatType: 'mirror',
    ease: 'linear',
  },
})

/**
 * Full-bleed color wash behind the hero — slow glassmorphic mesh drift.
 * Sits behind content; grid is untouched.
 */
export default function HeroAtmosphere() {
  const reduce = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-[-20%] opacity-90"
        style={{
          background:
            'linear-gradient(168deg, #E8E4FF 0%, #F3EEFF 14%, #FDF6F0 38%, #FDFBF7 58%, #F8F1E8 100%)',
          backgroundSize: '140% 140%',
        }}
        animate={
          reduce
            ? undefined
            : {
                backgroundPosition: ['0% 40%', '100% 60%', '0% 40%'],
              }
        }
        transition={
          reduce
            ? undefined
            : { duration: 110, repeat: Infinity, ease: 'linear' }
        }
      />

      <motion.div
        className="absolute -left-[14%] -top-[10%] h-[min(92vh,780px)] w-[min(92vh,780px)] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(125, 181, 255, 0.52) 0%, rgba(147, 197, 253, 0.18) 40%, transparent 68%)',
          filter: 'blur(52px)',
        }}
        {...(reduce
          ? {}
          : drift(['0vw', '14vw', '2vw'], ['0vh', '6vh', '-2vh'], 78))}
      />

      <motion.div
        className="absolute -right-[12%] top-[2%] h-[min(78vh,680px)] w-[min(78vh,680px)] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(186, 168, 255, 0.46) 0%, rgba(196, 181, 253, 0.16) 44%, transparent 70%)',
          filter: 'blur(56px)',
        }}
        {...(reduce
          ? {}
          : drift(['0vw', '-12vw', '-4vw'], ['0vh', '8vh', '3vh'], 92, 6))}
      />

      <motion.div
        className="absolute left-[22%] top-[28%] h-[min(70vh,620px)] w-[min(88vw,920px)] rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(255, 183, 130, 0.38) 0%, rgba(251, 191, 136, 0.14) 38%, transparent 72%)',
          filter: 'blur(44px)',
        }}
        {...(reduce
          ? {}
          : drift(['-6vw', '10vw', '-2vw'], ['0vh', '-5vh', '4vh'], 68, 3))}
      />

      <motion.div
        className="absolute left-1/2 top-[42%] h-[min(65vh,560px)] w-[min(75vw,800px)] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(99, 130, 210, 0.24) 0%, rgba(75, 131, 196, 0.08) 45%, transparent 72%)',
          filter: 'blur(40px)',
        }}
        {...(reduce
          ? {}
          : drift(['-8vw', '8vw', '0vw'], ['-3vh', '5vh', '2vh'], 84, 12))}
      />

      <motion.div
        className="absolute -bottom-[18%] left-1/2 h-[min(55vh,480px)] w-[min(110vw,1200px)] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse, rgba(255, 207, 224, 0.32) 0%, rgba(237, 220, 255, 0.12) 50%, transparent 72%)',
          filter: 'blur(48px)',
        }}
        {...(reduce
          ? {}
          : drift(['-5vw', '6vw', '-1vw'], ['0vh', '-6vh', '2vh'], 96, 18))}
      />

      <motion.div
        className="absolute inset-0 opacity-[0.32]"
        style={{
          background:
            'radial-gradient(ellipse 90% 72% at 50% 38%, transparent 42%, rgba(253, 251, 247, 0.55) 100%)',
        }}
        animate={
          reduce
            ? undefined
            : {
                opacity: [0.28, 0.36, 0.28],
              }
        }
        transition={
          reduce
            ? undefined
            : { duration: 72, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(253, 251, 247, 0.85) 55%, #FDFBF7 100%)',
        }}
      />
    </div>
  )
}
