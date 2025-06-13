import { DashboardHeader } from "../../dashboard-header"
import { DashboardShell } from "../../dashboard-shell"
import { OutboundForm } from "../../forms/outbound-form"

export default function NewOutboundPage() {
  return (
    <DashboardShell>
      {/* <DashboardHeader heading="New Outbound Transaction" description="Create a new outbound inventory transaction." /> */}
      <div className="grid gap-6 max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <OutboundForm />
      </div>
    </DashboardShell>
  )
}
