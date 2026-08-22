import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import PaceStats from "@/components/pace-pro/pace-stats";
import IntakeForm from "@/components/pace-pro/intake-form";
import IntakeRecords from "@/components/pace-pro/intake-records";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_auth/")({
  component: PaceProPage,
});

function PaceProPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function triggerRefresh() {
    setRefreshTrigger((n) => n + 1);
  }

  const items = [
    {
      value: "stats",
      path: "/Dashboard",
      content: <PaceStats refreshTrigger={refreshTrigger} />,
    },
    {
      value: "form",
      path: "/Intake Form",
      content: <IntakeForm onVehicleAdded={triggerRefresh} />,
    },
    {
      value: "records",
      path: "/Vehicle Records",
      content: (
        <IntakeRecords
          refreshTrigger={refreshTrigger}
          onVehiclesUpdated={triggerRefresh}
        />
      ),
    },
  ];

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="records"
      className="space-y-2"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all data-[state=open]:shadow-md"
        >
          <AccordionTrigger className="px-2 text-sm font-bold hover:no-underline hover:bg-muted/50 cursor-pointer">
            <span>
              Pace Pro{" "}
              <span className="font-normal text-muted-foreground">
                {item.path}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="h-auto p-2">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
