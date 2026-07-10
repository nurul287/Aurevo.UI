import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);

import {
  useBulkUpdateBrandStatus,
  useCreateBrand,
  useDeleteBrand,
  useUpdateBrand,
} from "../use-brand-mutation";

describe("brand mutations", () => {
  const showSuccess = vi.fn();
  const showError = vi.fn();

  beforeEach(() => {
    showSuccess.mockClear();
    showError.mockClear();
    mockUseToast.mockReturnValue({
      showSuccess,
      showError,
    } as unknown as ReturnType<typeof useToast>);
  });

  it("useCreateBrand posts multipart form data and shows a success toast", async () => {
    let receivedName: string | null = null;
    server.use(
      http.post(`${API_URL}/brands`, async ({ request }) => {
        const form = await request.formData();
        receivedName = String(form.get("name"));
        return HttpResponse.json({ success: true, data: { id: "b1" } });
      }),
    );

    const { result } = renderHookWithQueryClient(() => useCreateBrand());
    result.current.mutate({ name: "Nike", slug: "nike" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(receivedName).toBe("Nike");
    expect(showSuccess).toHaveBeenCalledWith(
      "Brand Created",
      "Brand has been successfully created",
    );
  });

  it("useUpdateBrand shows an error toast on failure", async () => {
    server.use(
      http.patch(`${API_URL}/brands/b1`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Slug already exists" } },
          { status: 422 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useUpdateBrand());
    result.current.mutate({ id: "b1", name: "Adidas" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(
      "Failed to Update Brand",
      "Slug already exists",
    );
  });

  it("useDeleteBrand deletes and shows a success toast", async () => {
    server.use(
      http.delete(
        `${API_URL}/brands/b1`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useDeleteBrand());
    result.current.mutate("b1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Brand Deleted",
      "Brand has been successfully deleted",
    );
  });

  it("useBulkUpdateBrandStatus activates every brand and reports the count", async () => {
    server.use(
      http.patch(`${API_URL}/brands/:id`, () =>
        HttpResponse.json({ success: true, data: { id: "1" } }),
      ),
    );

    const { result } = renderHookWithQueryClient(() =>
      useBulkUpdateBrandStatus(),
    );
    result.current.mutate({ brandIds: ["b1", "b2", "b3"], isActive: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Brands Updated",
      "3 brands have been activated",
    );
  });
});
