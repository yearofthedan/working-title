import { BasePageObject } from "@/features/__testHelpers__/BasePageObject"
import { CanvasStepPageObject } from "../step/__testHelpers__/CanvasStepPageObject"
import { EmptyCanvasPageObject } from "./EmptyCanvasPageObject"

export class CanvasPageObject extends BasePageObject {
  stepByType(stepType: string) {
    const locator = this.host.getByRole('article', { name: stepType })
    return new CanvasStepPageObject(locator)
  }

  get emptyState() {
    return new EmptyCanvasPageObject(this.host)
  }
}