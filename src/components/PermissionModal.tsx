import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onRequestPermission: () => void;
  onClose: () => void;
  status: 'prompt' | 'denied' | 'granted' | 'unknown';
}

const PermissionModal = ({ isOpen, onRequestPermission, onClose, status }: PermissionModalProps) => {
  const isDenied = status === 'denied';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="permission-modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass-card p-6 w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/50 transition-colors"
            >
              <X size={18} className="text-muted-foreground" />
            </button>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center"
              >
                <MapPin size={28} className="text-primary" />
              </motion.div>

              <h2 className="text-xl font-semibold mb-2">
                {isDenied ? 'Location Access Denied' : 'Enable Location'}
              </h2>
              
              <p className="text-muted-foreground text-sm mb-6">
                {isDenied 
                  ? 'Please enable location access in your browser settings to track your daily movement.'
                  : 'Tracker needs access to your location to log your daily movement and calculate distance traveled.'
                }
              </p>

              {!isDenied ? (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onRequestPermission}
                  className="btn-primary w-full"
                >
                  Allow Location Access
                </motion.button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Open your browser settings → Privacy → Location → Allow for this site
                  </p>
                  <button
                    onClick={onClose}
                    className="btn-secondary w-full"
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PermissionModal;
