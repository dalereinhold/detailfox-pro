import { ArrowRight, Clock, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LandingProps {
  onOpenDetailPace: () => void;
  onOpenDetailFlow: () => void;
}

export default function Landing({ onOpenDetailPace, onOpenDetailFlow }: LandingProps) {
  return (
    <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
      {/* Hero Section */}
      <section className="mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl leading-[1.1]">
          Welcome to DetailFox Pro
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          A collection of lightweight, precision tools for the hobby detailer.
        </p>
      </section>

      {/* Tools Section */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
            My tools
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-4xl">
          {/* DetailPace */}
          <Card className="border-l-4 border-l-green-500 transition-colors hover:border-l-green-400">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1">
                    Tool
                  </p>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    DetailPace Pro
                  </CardTitle>
                </div>
                <div className="flex items-center justify-center w-9 h-9 bg-muted text-foreground rounded-md">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-xs font-semibold px-2 py-0.5 border rounded-md uppercase tracking-wider text-green-600 bg-background border-border">
                  Available
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 border rounded-md uppercase tracking-wider text-muted-foreground bg-muted border-border">
                  Time tracking
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-5">
                Time-tracking and intake for the detailing bay. Log vehicles,
                run live timers, and watch your stats update in real time.
              </p>
              <Button onClick={onOpenDetailPace} className="w-full gap-2">
                Open app
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* DetailFlow */}
          <Card className="border-l-4 border-l-green-500 transition-colors hover:border-l-green-400">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1">
                    Tool
                  </p>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    DetailFlow Pro
                  </CardTitle>
                </div>
                <div className="flex items-center justify-center w-9 h-9 bg-muted text-foreground rounded-md">
                  <ListTodo className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-xs font-semibold px-2 py-0.5 border rounded-md uppercase tracking-wider text-green-600 bg-background border-border">
                  Available
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 border rounded-md uppercase tracking-wider text-muted-foreground bg-muted border-border">
                  Workflows
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-5">
                Guided, timed routine workflows. Pick a service, run a
                step-by-step checklist with a high-precision timer, and review
                your performance at the end.
              </p>
              <Button onClick={onOpenDetailFlow} className="w-full gap-2">
                Open app
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
