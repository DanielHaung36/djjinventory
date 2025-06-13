import { DashboardHeader } from "../../dashboard-header"
import { DashboardShell } from "../../dashboard-shell"
import { InboundForm } from "../../forms/inbound-form"

export default function NewInboundPage() {
  return (
    <DashboardShell >
      {/*<div className="flex just">*/}
      {/*<DashboardHeader heading="New Inbound Transaction" description="Create a new inbound inventory transaction." />*/}
      {/*</div>*/}
      <div className="grid gap-6 max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <InboundForm />
      </div>
    </DashboardShell>
  )
}
