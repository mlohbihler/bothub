import { StepEvent } from '../../@types'

export default class PeriodTimeout {
  periodSteps: number
  deadline: number
  delegateFn: (evt: StepEvent) => void

  constructor(periodSteps: number, delegateFn: (evt: StepEvent) => void) {
    this.periodSteps = periodSteps
    this.deadline = periodSteps
    this.delegateFn = delegateFn
  }

  step(evt: StepEvent) {
    if (evt.step >= this.deadline) {
      this.deadline += this.periodSteps
      this.delegateFn(evt)
    }
  }
}
