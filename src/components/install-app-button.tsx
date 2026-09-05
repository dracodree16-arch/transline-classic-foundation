import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const handler = (next: Event) => {
      next.preventDefault();
      setEvent(next as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (!event) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={async () => {
        await event.prompt();
        await event.userChoice;
        setEvent(null);
      }}
    >
      <Download data-icon="inline-start" /> Install app
    </Button>
  );
}
