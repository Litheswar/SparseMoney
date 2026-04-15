import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogOut, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function LogoutDialog({ open, onOpenChange, onConfirm }: LogoutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white border-[#4A9A6E]/10 rounded-[2rem] p-8 max-w-[400px] shadow-2xl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6">
            <LogOut className="w-8 h-8 text-rose-500" />
          </div>
          
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black font-heading text-[#1E2937] mb-2">
              Sign Out?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#64748B] text-sm leading-relaxed mb-8">
              Are you sure you want to end your session? Your automated wealth strategy will continue running in the background.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="w-full flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="flex-1 rounded-xl h-12 border-[#4A9A6E]/10 text-[#64748B] font-bold hover:bg-[#F8FAF5] hover:text-[#1E2937] transition-all">
              Stay Signed In
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              className="flex-1 rounded-xl h-12 bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all border-none"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
