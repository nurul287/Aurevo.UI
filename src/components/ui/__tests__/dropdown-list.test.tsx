import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DropDownList, type DropDownListOption } from "../dropdown-list";

const OPTIONS: DropDownListOption[] = [
  { value: "shoes", label: "Shoes" },
  { value: "bags", label: "Bags" },
  { value: "hats", label: "Hats" },
];

describe("DropDownList", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<DropDownList options={OPTIONS} onChange={vi.fn()} placeholder="Pick one" />);
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("shows the selected option's label", () => {
    render(<DropDownList options={OPTIONS} value="bags" onChange={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveTextContent("Bags");
  });

  it("opens the option list on click and closes after selecting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DropDownList options={OPTIONS} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    expect(screen.getAllByRole("listbox")).toHaveLength(2);

    await user.click(screen.getByRole("option", { name: "Hats" }));

    expect(onChange).toHaveBeenCalledWith("hats");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters options as the user types in the search box", async () => {
    const user = userEvent.setup();
    render(<DropDownList options={OPTIONS} onChange={vi.fn()} searchPlaceholder="Filter" />);

    await user.click(screen.getByRole("button"));
    await user.type(screen.getByPlaceholderText("Filter"), "ba");

    expect(screen.getByRole("option", { name: "Bags" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Shoes" })).not.toBeInTheDocument();
  });

  it("shows the empty message when no options match the search", async () => {
    const user = userEvent.setup();
    render(
      <DropDownList
        options={OPTIONS}
        onChange={vi.fn()}
        emptyMessage="Nothing here"
      />
    );

    await user.click(screen.getByRole("button"));
    await user.type(screen.getByRole("textbox"), "zzz");

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<DropDownList options={OPTIONS} onChange={vi.fn()} disabled />);

    await user.click(screen.getByRole("button"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes when Escape is pressed", async () => {
    render(<DropDownList options={OPTIONS} onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getAllByRole("listbox")).toHaveLength(2);

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
