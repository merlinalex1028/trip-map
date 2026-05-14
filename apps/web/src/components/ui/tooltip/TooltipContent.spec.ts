import { describe, expect, it } from "vitest"
import tooltipContentSource from "./TooltipContent.vue?raw"

describe("TooltipContent", () => {
  it("allows consumers to hide the default arrow without changing other tooltip defaults", () => {
    expect(tooltipContentSource).toContain("hideArrow?: boolean")
    expect(tooltipContentSource).toContain("hideArrow: false")
    expect(tooltipContentSource).toContain('reactiveOmit(props, "class", "hideArrow")')
    expect(tooltipContentSource).toContain('v-if="!props.hideArrow"')
    expect(tooltipContentSource).toContain('data-slot="tooltip-arrow"')
  })
})
