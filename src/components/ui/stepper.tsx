import {Check, Lock} from "lucide-react"
import {Spinner} from "@/components/ui/spinner"
import type {Step, StepperProps, StepStatus} from "@types"

export function Stepper({steps, isProcessing, processingStepNumber}: StepperProps) {
  const getStepIcon = (step: Step, status: StepStatus, isStepProcessing?: boolean) => {
    if (isStepProcessing) {
      return <Spinner size="md" className="text-primary"/>
    }

    switch (status) {
      case "completed":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-5 w-5"/>
          </div>
        )
      case "active":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
            <span className="text-sm font-semibold text-primary">
              {step.number}
            </span>
          </div>
        )
      case "disabled":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-muted/30 text-muted-foreground">
            <Lock className="h-4 w-4"/>
          </div>
        )
      case "pending":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-background text-muted-foreground">
            <span className="text-sm font-semibold">{step.number}</span>
          </div>
        )
      default:
        return null
    }
  }

  const getStepClasses = (status: StepStatus) => {
    const base = "relative"
    switch (status) {
      case "completed":
      case "active":
        return `${base} opacity-100`
      case "disabled":
      case "pending":
        return `${base} opacity-60`
      default:
        return base
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isStepProcessing = isProcessing && step.number === processingStepNumber
          const showContent =
            step.status === "active" ||
            (step.status === "completed" && step.content) ||
            (step.status === "disabled" && step.content)

          return (
            <div key={step.number} className={getStepClasses(step.status)}>
              <div className="flex gap-4">
                {/* Step Icon */}
                <div className="flex flex-col items-center">
                  {getStepIcon(step, step.status, isStepProcessing)}
                  {index < steps.length - 1 && (
                    <div
                      className={`mt-2 h-12 w-0.5 ${
                        step.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/20"
                      }`}/>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-3 pb-6">
                  <div>
                    <h4 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  {showContent && step.content && (
                    <div className="rounded-lg border border-border/40 bg-muted/5 p-4">
                      {step.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
