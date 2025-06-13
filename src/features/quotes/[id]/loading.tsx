import { Loader2 } from "lucide-react"

export default function QuoteDetailLoading() {
  return (
    <div className="container mx-auto py-6 flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="text-gray-500">Loading quote details...</p>
      </div>
    </div>
  )
}
