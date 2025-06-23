"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils" // Assuming you have a cn utility

interface ApprovalReasonDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  actionType: "approve" | "reject"
  quoteNumber: string
}

export function ApprovalReasonDialog({
  isOpen,
  onClose,
  onSubmit,
  actionType,
  quoteNumber,
}: ApprovalReasonDialogProps) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (isOpen) {
      setReason("") // Reset reason when dialog opens
    }
  }, [isOpen])

  const handleSubmit = () => {
    onSubmit(reason)
  }

  const isRejectAction = actionType === "reject"
  const isSubmitDisabled = isRejectAction && !reason.trim()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold">
            {actionType === "approve" ? "Approve" : "Reject"} Quote: {quoteNumber}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Please provide a reason for {actionType === "approve" ? "approving" : "rejecting"} this quote. This reason
            will be recorded.
            {isRejectAction && <span className="text-destructive">* (Reason required for rejection)</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <Label htmlFor="reason" className="text-sm font-medium">
            Reason
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Enter reason for ${actionType}...`}
            rows={4}
            className="resize-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <DialogFooter className="sm:justify-end space-x-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={cn(
              isRejectAction
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : "bg-green-600 hover:bg-green-700 text-white",
            )}
          >
            Submit {actionType === "approve" ? "Approval" : "Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
