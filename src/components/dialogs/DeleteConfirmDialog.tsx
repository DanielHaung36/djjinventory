import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteConfirmDialogProps {
  itemName: string
  itemType?: string
  onConfirm: () => void
  isDeleting?: boolean
  children?: React.ReactNode
  description?: string
}

export const DeleteConfirmDialog = ({ 
  itemName, 
  itemType = "item",
  onConfirm, 
  isDeleting = false,
  children,
  description
}: DeleteConfirmDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        )}
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete {itemType}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>You are about to delete the following {itemType}:</p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-semibold text-gray-900">{itemName}</p>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 font-medium mb-2">⚠️ Warning: This action cannot be undone</p>
              {description ? (
                <p className="text-sm text-red-700">{description}</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  <li>Permanently delete {itemType} information</li>
                  <li>Remove associated data</li>
                  <li>May affect historical records</li>
                  <li>Related files will also be deleted</li>
                </ul>
              )}
            </div>
            
            <p className="text-gray-600">
              If you are sure you want to continue, please click "Delete" button.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}