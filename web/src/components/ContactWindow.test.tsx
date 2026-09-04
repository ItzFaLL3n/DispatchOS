// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ContactWindow } from "@/components/ContactWindow";

describe("ContactWindow", () => {
  it("renders a light and a local time when a timezone is set", () => {
    const { container } = render(
      <ContactWindow timezone="America/Chicago" operatorTz="Asia/Kolkata" />,
    );
    expect(container.querySelector(".cw-dot")).not.toBeNull();
    expect(container.textContent).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
    expect(container.textContent).toContain("you:");
  });

  it("shows a placeholder-free 'timezone not set' when there is none", () => {
    const { container } = render(
      <ContactWindow timezone={null} operatorTz="Asia/Kolkata" />,
    );
    expect(container.querySelector(".cw-dot")).toBeNull();
    expect(container.textContent).toContain("timezone not set");
  });

  it("shows the contact-hours note next to the light", () => {
    const { container } = render(
      <ContactWindow
        timezone="America/Chicago"
        contactHours="evenings only"
        operatorTz="Asia/Kolkata"
      />,
    );
    expect(container.textContent).toContain("evenings only");
  });

  it("inline variant renders just the dot + time", () => {
    const { container } = render(
      <ContactWindow variant="inline" timezone="America/Denver" operatorTz="UTC" />,
    );
    expect(container.querySelector(".cw-inline")).not.toBeNull();
    expect(container.textContent).not.toContain("you:");
  });
});
