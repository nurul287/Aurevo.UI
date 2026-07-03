import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { createMockSupabaseClient } from "@/test/mocks/supabase";
import { useToast } from "@/hooks/use-toast";

const API_URL = "http://localhost:3001/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);

import {
  useBulkUpdateCategoryStatus,
  useCreateCategory,
  useDeleteCategory,
} from "../use-category-mutation";

describe("category mutations", () => {
  const showSuccess = vi.fn();
  const showError = vi.fn();

  beforeEach(() => {
    showSuccess.mockClear();
    showError.mockClear();
    mockUseToast.mockReturnValue({ showSuccess, showError } as unknown as ReturnType<
      typeof useToast
    >);
  });

  it("useCreateCategory posts multipart form data and shows a success toast", async () => {
    let receivedFields: Record<string, string> = {};
    server.use(
      http.post(`${API_URL}/categories`, async ({ request }) => {
        const form = await request.formData();
        receivedFields = { name: String(form.get("name")), slug: String(form.get("slug")) };
        return HttpResponse.json({ success: true, data: { id: "c1" } });
      })
    );

    const { result } = renderHookWithQueryClient(() => useCreateCategory());
    result.current.mutate({ name: "Shoes", slug: "shoes" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(receivedFields).toEqual({ name: "Shoes", slug: "shoes" });
    expect(showSuccess).toHaveBeenCalledWith(
      "Category Created",
      "Category has been successfully created"
    );
  });

  it("useCreateCategory shows an error toast on failure", async () => {
    server.use(
      http.post(`${API_URL}/categories`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Slug taken" } },
          { status: 422 }
        )
      )
    );

    const { result } = renderHookWithQueryClient(() => useCreateCategory());
    result.current.mutate({ name: "Shoes", slug: "shoes" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith("Failed to Create Category", "Slug taken");
  });

  it("useDeleteCategory deletes and shows a success toast", async () => {
    server.use(
      http.delete(`${API_URL}/categories/c1`, () => new HttpResponse(null, { status: 204 }))
    );

    const { result } = renderHookWithQueryClient(() => useDeleteCategory());
    result.current.mutate("c1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Category Deleted",
      "Category has been successfully deleted"
    );
  });

  it("useDeleteCategory shows an error toast when the category has children", async () => {
    server.use(
      http.delete(`${API_URL}/categories/c1`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Category has child categories" } },
          { status: 422 }
        )
      )
    );

    const { result } = renderHookWithQueryClient(() => useDeleteCategory());
    result.current.mutate("c1");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(
      "Failed to Delete Category",
      "Category has child categories"
    );
  });

  it("useBulkUpdateCategoryStatus updates every category and reports the count", async () => {
    server.use(
      http.patch(`${API_URL}/categories/:id`, () =>
        HttpResponse.json({ success: true, data: { id: "1" } })
      )
    );

    const { result } = renderHookWithQueryClient(() => useBulkUpdateCategoryStatus());
    result.current.mutate({ categoryIds: ["c1", "c2"], isActive: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Categories Updated",
      "2 categories have been deactivated"
    );
  });
});
