import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

interface Tour360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tourUrl?: string;
}

const Tour360Modal = ({ isOpen, onClose, title, tourUrl }: Tour360ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title} - 360° Virtual Tour</DialogTitle>
          <DialogDescription>
            Use your mouse or touch to look around and explore the facility
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 bg-muted rounded-lg overflow-hidden relative h-full">
          {tourUrl ? (
            <iframe
              src={tourUrl}
              className="w-full h-full"
              allowFullScreen
              title={`360° tour of ${title}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🏫</div>
                <h3 className="text-xl font-semibold mb-2">360° Tour Coming Soon</h3>
                <p className="text-muted-foreground">
                  Interactive virtual tour of {title} will be available here.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Contact the school to schedule an in-person visit in the meantime.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Tour360Modal;
