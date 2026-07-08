import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { useAddresses, useCreateAddress, useDeleteAddress } from "../use-address";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ADDRESS = {
  id: "addr-1",
  userId: "user-1",
  type: "shipping",
  isDefault: true,
  label: "Home",
  name: "Nurul Alam",
  phone: "01887375148",
  address: "House 12, Road 5",
  district: "Dhaka",
  upazila: "Dhamrai",
};

describe("useAddresses", () => {
  it("returns the address list in snake_case", async () => {
    server.use(
      http.get(`${API_URL}/auth/addresses`, () =>
        HttpResponse.json({ success: true, data: [ADDRESS] }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useAddresses());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0]!.is_default).toBe(true);
    expect(result.current.data![0]!.district).toBe("Dhaka");
  });
});

describe("useCreateAddress", () => {
  it("creates an address and invalidates the list", async () => {
    let listRequests = 0;
    server.use(
      http.get(`${API_URL}/auth/addresses`, () => {
        listRequests++;
        return HttpResponse.json({ success: true, data: [] });
      }),
      http.post(`${API_URL}/auth/addresses`, () =>
        HttpResponse.json({ success: true, data: ADDRESS }, { status: 201 }),
      ),
    );

    const { result, queryClient } = renderHookWithQueryClient(() => useCreateAddress());
    // Prime the list cache so invalidation triggers a refetch
    await queryClient.fetchQuery({
      queryKey: ["addresses"],
      queryFn: () => Promise.resolve([]),
    });

    result.current.mutate({
      label: "Home",
      name: "Nurul Alam",
      phone: "01887375148",
      address: "House 12, Road 5",
      district: "Dhaka",
      upazila: "Dhamrai",
      isDefault: true,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.is_default).toBe(true);
  });
});

describe("useDeleteAddress", () => {
  it("deletes an address", async () => {
    server.use(
      http.delete(`${API_URL}/auth/addresses/addr-1`, () =>
        HttpResponse.json({ success: true }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useDeleteAddress());
    result.current.mutate("addr-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
