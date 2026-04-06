import { motion, AnimatePresence } from "motion/react";
import { patients, type Patient } from "../lib/patients";
import { TrialMatchingCriteriaFlow } from "./TrialMatchingCriteriaFlow";

interface CriteriaMatchingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPatientQualification: (patient: Patient) => void;
}

export default function CriteriaMatchingPanel({ isOpen, onClose, onViewPatientQualification }: CriteriaMatchingPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[45]"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: -540 }}
            animate={{ x: 0 }}
            exit={{ x: -540 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[500px] bg-white shadow-2xl border-r border-gray-200 z-50 flex flex-col"
          >
            <TrialMatchingCriteriaFlow
              patientPool={patients}
              variant="panel"
              onClose={onClose}
              onViewPatientQualification={onViewPatientQualification}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
