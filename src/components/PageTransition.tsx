import { motion } from "framer-motion";
import { ReactNode } from "react";

const easing: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: easing } }}
    exit={{ opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.3, ease: easing } }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
