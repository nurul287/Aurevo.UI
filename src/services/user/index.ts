// Query hooks
export * from "./use-user-query";

// Mutation hooks
export * from "./use-user-mutation";

// Saved addresses — hooks re-exported explicitly; the UserAddress type is NOT
// re-exported here because services/types.ts already exports a legacy type of
// the same name (import it from "@/services/user/use-address" directly).
export {
  addressQueryKeys,
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useUpdateAddress,
  type AddressInput,
} from "./use-address";
