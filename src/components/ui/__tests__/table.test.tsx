import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table";

describe("Table", () => {
  it("renders a full table with header, rows, and caption", () => {
    render(
      <Table>
        <TableCaption>Recent orders</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>ORD-1</TableCell>
            <TableCell>Shipped</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Order" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "ORD-1" })).toBeInTheDocument();
    expect(screen.getByText("Recent orders")).toBeInTheDocument();
  });
});
