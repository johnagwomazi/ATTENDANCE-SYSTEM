import { motion } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export const AppShell = ({ navItems, children, className = '', mobileNav = null }) => {
  return (
    <div className={`min-h-screen lg:flex ${className}`}>
      <Sidebar navItems={navItems} />
      <main className="flex-1 px-4 pb-24 pt-4 md:px-6 lg:px-8 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-[1600px]"
        >
          {children}
        </motion.div>
      </main>
      {mobileNav || <BottomNav navItems={navItems} />}
    </div>
  );
};
