import {Check, Lock} from "lucide-react"
import {Spinner} from "@/shared/ui/spinner"
import type {StepperProps, StepStatus} from "@types"

function StatusMark({status, number, processing}: {status: StepStatus; number: number; processing: boolean}) {
  if (processing) {return <Spinner size="sm" className="text-acid" />}
  if (status === "completed") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-acid text-ink">
        <Check className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (status === "disabled") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground">
        <Lock className="h-3 w-3" />
      </span>
    )
  }
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
      {status === "active" ? "In progress" : `Step ${number}`}
    </span>
  )
}

export function Stepper({steps, isProcessing, processingStepNumber}: StepperProps) {
  return (
    <div className="chapter-list">
      {steps.map((step) => {
        const isStepProcessing = isProcessing && step.number === processingStepNumber
        const showContent =
          step.status === "active" ||
          (step.status === "completed" && step.content) ||
          (step.status === "disabled" && step.content)

        return (
          <section
            key={step.number}
            className="chapter"
            data-status={step.status}
            aria-current={step.status === "active" ? "step" : undefined}>
            <div className="chapter__number" aria-hidden="true">
              {String(step.number).padStart(2, "0")}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="chapter__title">{step.title}</h2>
                <StatusMark
                  status={step.status}
                  number={step.number}
                  processing={Boolean(isStepProcessing)}/>
              </div>
              <p className="chapter__description mt-2">{step.description}</p>

              {showContent && step.content && (
                <div className="mt-5 border-t border-border/70 pt-5">{step.content}</div>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
