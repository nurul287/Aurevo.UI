# Graph Report - .  (2026-07-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1280 nodes · 3529 edges · 119 communities (62 shown, 57 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6ca61f6f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 112
- Community 116
- Community 118

## God Nodes (most connected - your core abstractions)
1. `cn()` - 111 edges
2. `useToast()` - 91 edges
3. `Button()` - 39 edges
4. `useAuth()` - 31 edges
5. `formatPrice()` - 30 edges
6. `useCart()` - 29 edges
7. `APP_PATHS` - 27 edges
8. `Input()` - 25 edges
9. `server` - 21 edges
10. `Label` - 20 edges

## Surprising Connections (you probably didn't know these)
- `useCarousel()` --references--> `react`  [EXTRACTED]
  src/components/ui/carousel.tsx → package.json
- `useSidebar()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json
- `TeamSwitcher()` --references--> `react`  [EXTRACTED]
  src/components/admin/team-switcher.tsx → package.json
- `SidebarMenuSkeleton()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json
- `SidebarProvider()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json

## Import Cycles
- None detected.

## Communities (119 total, 57 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (98): BulkImageUploadDialogProps, QueuedFile, CategoryImageField(), CategoryImageFieldProps, APPAREL_SIZES, ColorRow, EU_SHOE_SIZES, GenerateVariantsDialog() (+90 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (44): DashboardAddressesPage(), computeCartTotals(), getCartLineUnitPrice(), mockUseToast, useAddToCart(), useCartMutations(), useClearCart(), useMigrateGuestCart() (+36 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (20): MessengerIconProps, ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState, LanguageSwitcher(), MessengerChat(), messengerUrl(), pageId (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (38): mockUseAdminProducts, mockUseBulkCreateVariants, mockUseProduct, useToast(), AdminImagesPage(), AdminProductsPage(), ProductFormData, variantAvailableUnits() (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (26): CartItemSizeSelector(), CartSidePanel(), mockUseCart, mockUseProducts, mockUseToast, Layout(), ProductCard(), CART_ITEM (+18 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (24): OAuthSuccessLandingRedirect(), OAuthTokens, clearStoredTokens(), storeTokens(), consumeOAuthLoginPending(), markOAuthLoginPending(), peekOAuthLoginPending(), ForgotPasswordPage() (+16 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (20): AurevoBlack(), AurevoBlackProps, AurevoWhite(), AurevoWhiteProps, EmailIcon(), EmailIconProps, FacebookSquareIcon(), FacebookSquareIconProps (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.19
Nodes (24): MetaPixelTracker(), addToCartDedupe, getFbq(), getMetaPixelId(), getMetaPixelNoscriptImageUrl(), initMetaPixel(), injectOfficialPixelBootstrap(), isMetaPixelEnabled() (+16 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (29): DOM, DOM.Iterable, e2e, ES2020, playwright.config.ts, ./src/*, src/components/button-showcase.tsx, compilerOptions (+21 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (13): ContactUsSection(), FullCollectionBanner(), HeroSection(), NewCollectionSection(), NewsletterBanner(), OurShopSection(), PromotionalBanners(), FIRST_ROW (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.23
Nodes (11): InfoPageLayout(), InfoPageLayoutProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (22): AppSidebar(), data, mockUseAuth, Sidebar(), SidebarContent(), SidebarContext, SidebarContextProps, SidebarFooter() (+14 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (16): PaginationMeta, AdminInventoryPage(), unwrapRelation(), variantProductName(), useRestockInventory(), computeInventoryStats(), InventoryLevelsResult, InventoryMovement (+8 more)

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (11): FacebookIconProps, GoogleIcon(), GoogleIconProps, OAuthErrorRouteHandler(), humanizeOAuthError(), parseParams(), parseSupabaseOAuthErrorFromUrl(), safeDecode() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (12): DropDownList(), DropDownListOption, DropDownListProps, RadioGroup, RadioGroupItem, OPTIONS, BANGLADESH_DISTRICTS, BangladeshDistrict (+4 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (22): addrStr(), AdminOrderDetailPage(), getCustomerDisplayName(), getCustomerPhoneDisplay(), isSyntheticGuestEmail(), linesFromAddressJson(), nameFromAddressJson(), orderEmailForDisplay() (+14 more)

### Community 16 - "Community 16"
Cohesion: 0.10
Nodes (18): HomePage(), adminRoutes, EmailConfirmationPage, ForgotPasswordPage, guestRoutes, LoginPage, RegisterPage, ResetPasswordPage (+10 more)

### Community 17 - "Community 17"
Cohesion: 0.19
Nodes (13): DropdownMenuCheckboxItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent(), DropdownMenuSubTrigger(), SidebarGroup() (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (19): COLOR_HINTS, productMatchesPromoColorRole(), PROMOTIONAL_BANNER_PRODUCT_SLUGS, PromotionalBannerColor, withSortedVariantsOnProducts(), AdminImageRow, AdminImagesParams, AdminProductsParams (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.21
Nodes (17): api, apiDownloadFile(), ApiError, apiFetch(), apiFetchForm(), apiFetchList(), ApiListResult, buildError() (+9 more)

### Community 20 - "Community 20"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 21 - "Community 21"
Cohesion: 0.16
Nodes (10): HeaderProductSearch(), HeaderProductSearchProps, pickSuggestionImage(), mockUseCart, mockUseProducts, mockUseToast, mockNavigate, mockUseSearchProducts (+2 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (18): AddressType, ApiResponse, Inventory, PaginationParams, Payment, PaymentMethod, Product, ProductImage (+10 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (13): AdminLayout(), mockUseAuth, AdminGuard(), mockUseAuth, AdminBrandsPage, AdminCategoriesPage, AdminDashboardPage, AdminImagesPage (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.17
Nodes (17): AddProductParams, CancelOrderInventoryParams, DecreaseStockParams, invalidateInventory(), InventoryUpdateProductParams, ReserveStockParams, resolveInventoryId(), RestockParams (+9 more)

### Community 25 - "Community 25"
Cohesion: 0.21
Nodes (13): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.17
Nodes (15): BulkUpdateOrderStatusParams, CheckoutAddress, CreateGuestOrderParams, FULFILLMENT_STATUS_LABELS, normalizeAddress(), ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, UpdateFulfillmentStatusParams (+7 more)

### Community 27 - "Community 27"
Cohesion: 0.19
Nodes (10): AuthGuard(), mockUseAuth, useAuth(), EmailConfirmationPage(), DashboardProfilePage(), toDateInputValue(), DashboardAddressesPage, DashboardPage (+2 more)

### Community 28 - "Community 28"
Cohesion: 0.24
Nodes (11): AdminBrandsPage(), mockUseToast, buildBrandFormData(), CreateBrandParams, UpdateBrandParams, useBulkUpdateBrandStatus(), useCreateBrand(), useDeleteBrand() (+3 more)

### Community 29 - "Community 29"
Cohesion: 0.15
Nodes (13): eslint, devDependencies, eslint, @playwright/test, tailwindcss-animate, @types/node, @vitejs/plugin-react, @vitest/coverage-v8 (+5 more)

### Community 30 - "Community 30"
Cohesion: 0.18
Nodes (9): react, react, NavProjects(), TeamSwitcher(), PROJECTS, TEAMS, SidebarMenuSkeleton(), SidebarProvider() (+1 more)

### Community 31 - "Community 31"
Cohesion: 0.28
Nodes (9): Sheet(), SheetClose(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.21
Nodes (8): getOrderCustomerName(), nameFromAddress(), OrderWithUser, OrderWithUser, AdminDashboardPage(), AdminDashboardData, useAdminDashboard(), Order

### Community 33 - "Community 33"
Cohesion: 0.33
Nodes (11): AdminVariantRow, compareSizeLabels(), getFirstVariantForCart(), getUniqueSizesFromVariants(), parseSizeSortKey(), sortAdminVariantRows(), sortProductVariants(), sortUniqueSizeLabels() (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.22
Nodes (11): AdminCategoriesPage(), compareCategoriesBySort(), buildCategoryFormData(), CreateCategoryParams, UpdateCategoryParams, useBulkUpdateCategoryStatus(), useCreateCategory(), useDeleteCategory() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.19
Nodes (10): AdminOrdersParams, orderQueryKeys, OrderStats, OrderUser, NOTE: `api.get`/`apiFetch` converts every response key from camelCase to, useOrder(), useOrders(), useOrderStats() (+2 more)

### Community 36 - "Community 36"
Cohesion: 0.17
Nodes (12): scripts, build, coverage, dev, lint, preview, test, test:e2e (+4 more)

### Community 37 - "Community 37"
Cohesion: 0.24
Nodes (8): AuthContext, AuthProvider(), AuthProviderProps, AuthUser, buildProfileFieldsFromUserMetadata(), pickAvatar(), StoredSession, useClaimGuestOrders()

### Community 38 - "Community 38"
Cohesion: 0.22
Nodes (9): ACCEPTED_MIME_SET, BulkImageUploadDialog(), formatBytes(), newId(), mockUseAdminProducts, mockUseBulkUploadProductImages, mockUseProductVariants, useBulkUploadProductImages() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.35
Nodes (7): GuestGuard(), mockUseAuth, mockUseSession, useAuth(), useMeQuery(), useSession(), useUserProfile()

### Community 40 - "Community 40"
Cohesion: 0.24
Nodes (6): CategoryCard, HEX_CLIP, ProductCategorySection(), mockUseCategories, ProductsPage(), useCategories()

### Community 41 - "Community 41"
Cohesion: 0.22
Nodes (7): BANNER_CONFIG, PROMO_COPY, PromoBannerCard(), PromoBannerCardProps, mockUseCart, mockUsePromotionalBannerProducts, mockUseToast

### Community 42 - "Community 42"
Cohesion: 0.18
Nodes (8): mockUseAuth, mockUseCart, mockUseCategories, mockUseGuestCart, GuestCartContext, GuestCartContextType, GuestCartProvider(), GuestCartProviderProps

### Community 43 - "Community 43"
Cohesion: 0.36
Nodes (6): NavMain(), ITEMS, Collapsible(), CollapsibleContent(), CollapsibleTrigger(), SidebarMenuSubButton()

### Community 44 - "Community 44"
Cohesion: 0.36
Nodes (6): NavUser(), USER, Avatar(), AvatarFallback(), AvatarImage(), DropdownMenuGroup()

### Community 45 - "Community 45"
Cohesion: 0.22
Nodes (9): clsx, embla-carousel-react, dependencies, clsx, embla-carousel-react, react-i18next, @tailwindcss/vite, react-i18next (+1 more)

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 47 - "Community 47"
Cohesion: 0.39
Nodes (6): ProductCardProps, ProductCardTitle(), Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger()

### Community 48 - "Community 48"
Cohesion: 0.46
Nodes (4): addSavedAddress(), registerTestUser(), seedProductAndVariant(), TEST_ADDRESS

### Community 49 - "Community 49"
Cohesion: 0.38
Nodes (4): NumberStepper(), NumberStepperProps, Callback, useDebounceCallback()

### Community 50 - "Community 50"
Cohesion: 0.38
Nodes (5): LoadingIndicator(), LoadingIndicatorProps, LoadingSpinner(), LoadingSpinnerProps, sizeClasses

### Community 51 - "Community 51"
Cohesion: 0.53
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 52 - "Community 52"
Cohesion: 0.47
Nodes (4): AuthContextType, getProfileCompletion(), ProfileSegment, UserProfile

### Community 53 - "Community 53"
Cohesion: 0.40
Nodes (4): formatOrderShippingLine(), DashboardPage(), orderItemsSummary(), statusBadgeClass()

### Community 54 - "Community 54"
Cohesion: 0.60
Nodes (5): useCreateUserProfile(), useDeleteAvatar(), useUpdateUserProfile(), useUploadAvatar(), useUserMutations()

### Community 55 - "Community 55"
Cohesion: 0.40
Nodes (4): name, private, type, version

## Knowledge Gaps
- **371 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+366 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 17` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 10`, `Community 11`, `Community 14`, `Community 15`, `Community 21`, `Community 25`, `Community 30`, `Community 31`, `Community 32`, `Community 38`, `Community 43`, `Community 44`, `Community 47`, `Community 50`, `Community 51`, `Community 53`, `Community 59`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 45` to `Community 30`, `Community 55`, `Community 62`, `Community 63`, `Community 69`, `Community 70`, `Community 71`, `Community 73`, `Community 74`, `Community 76`, `Community 77`, `Community 78`, `Community 79`, `Community 80`, `Community 81`, `Community 82`, `Community 83`, `Community 84`, `Community 85`, `Community 86`, `Community 87`, `Community 88`, `Community 89`, `Community 90`, `Community 91`, `Community 92`, `Community 93`, `Community 94`, `Community 95`, `Community 96`, `Community 97`, `Community 98`, `Community 99`, `Community 100`?**
  _High betweenness centrality (0.197) - this node is a cross-community bridge._
- **Why does `react` connect `Community 30` to `Community 25`, `Community 11`, `Community 45`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _374 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05409981456099331 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06054054054054054 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06448202959830866 - nodes in this community are weakly interconnected._