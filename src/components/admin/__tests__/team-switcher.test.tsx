import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Home } from "lucide-react";
import { describe, expect, it } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TeamSwitcher } from "../team-switcher";

const TEAMS = [
  { name: "Aurevo", logo: Home, plan: "Pro" },
  { name: "Side Project", logo: Home, plan: "Free" },
];

function renderSwitcher(teams = TEAMS) {
  return render(
    <SidebarProvider>
      <TeamSwitcher teams={teams} />
    </SidebarProvider>
  );
}

describe("TeamSwitcher", () => {
  it("shows the first team as active by default", () => {
    renderSwitcher();
    expect(screen.getByText("Aurevo")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("renders nothing when there are no teams", () => {
    const { container } = renderSwitcher([]);
    expect(container.querySelector("li")).not.toBeInTheDocument();
  });

  it("switches the active team when another team is selected from the menu", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByText("Aurevo"));
    await user.click(screen.getByText("Side Project"));

    expect(screen.getByText("Free")).toBeInTheDocument();
  });
});
