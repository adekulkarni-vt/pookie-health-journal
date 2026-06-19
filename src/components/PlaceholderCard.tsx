import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlaceholderCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  color?: 'pink' | 'blue' | 'purple' | 'green' | 'yellow';
}

const colorClasses = {
  pink: 'bg-pastel-pink',
  blue: 'bg-pastel-blue',
  purple: 'bg-pastel-purple',
  green: 'bg-pastel-green',
  yellow: 'bg-pastel-yellow',
};

export function PlaceholderCard({
  title,
  description,
  icon,
  color = 'pink',
}: PlaceholderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-lg p-6 shadow-sm transition-transform hover:scale-105 hover:shadow-md',
        colorClasses[color]
      )}
    >
      {icon && <div className="mb-4 text-2xl">{icon}</div>}
      <h2 className="mb-2 text-xl font-semibold text-gray-900">{title}</h2>
      <p className="text-gray-700">{description}</p>
    </motion.div>
  );
}
