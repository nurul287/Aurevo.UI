# Graph Report - .  (2026-07-18)

## Corpus Check
- 84 files · ~793,566 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1577 nodes · 3720 edges · 195 communities (90 shown, 105 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 45 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

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
- Community 64
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
- Community 102
- Community 103
- Community 104
- Community 105
- Community 106
- Community 107
- Community 108
- Community 109
- Community 110
- Community 111
- Community 112
- Community 113
- Community 114
- Community 115
- Community 116
- Community 117
- Community 118
- Hero Section Gradient
- Pagination Components
- Product Cards Grid
- Products Grid + Hook
- Guest Route Guarding
- Public Routes
- BE CORS + Export Bug
- Order Stats Route Bug
- Footer Mobile Layout
- MSW Testing Dependency
- next-themes Dependency
- Radix Alert Dialog Dep
- Radix Avatar Dep
- Radix Checkbox Dep
- Radix Collapsible Dep
- Radix Dialog Dep
- Radix Dropdown Menu Dep
- Radix Label Dep
- Radix Popover Dep
- Radix Radio Group Dep
- Radix Select Dep
- Radix Slot Dep
- Radix Tabs Dep
- Radix Tooltip Dep
- React DOM Dependency
- react-i18next Dependency
- react-markdown Dependency
- React Router Dependency
- Sentry React Dependency
- Sonner Toast Dependency
- tailwind-merge Dependency
- Tailwind CSS Dependency
- Tailwind Vite Plugin Dep
- Vercel Analytics Dep
- Vercel Speed Insights Dep
- Postgres Dependency
- Testing Library Jest-DOM Dep
- Testing Library React Dep
- Testing Library User Event Dep
- Lodash Types Dep
- React Types Dep
- React DOM Types Dep
- TypeScript Dependency
- Vite Dependency
- Vitest Dependency
- Vercel Rewrites Config
- Auth State Reactivity Gotcha
- AlertDialog Delete Confirmation
- Development Workflow (build/verify/commit)
- graphify Knowledge Graph Workflow
- graphify Honesty Rules
- /graphify Command
- Hero Blob Animation
- Features Section (cards)
- Newsletter Section
- Category Service
- useCart Hook
- Auth Service
- Product Service
- Service-to-Query-Hooks Migration
- User Service
- Export Button Disabled Bug
- Image Upload Refresh Bug
- Inventory Pagination
- Local DB Wipe Recovery
- CI / Merge Workflow
- MSW Test Handlers
- API Layer (api.ts)
- Aurevo Fashion FE SPA
- Storefront/Dashboard/Admin Features
- Project Structure (src/ layout)
- Bangladesh Upazilas Data

## God Nodes (most connected - your core abstractions)
1. `cn()` - 109 edges
2. `useToast()` - 91 edges
3. `Button()` - 37 edges
4. `useAuth()` - 31 edges
5. `useCart()` - 29 edges
6. `formatPrice()` - 28 edges
7. `APP_PATHS` - 26 edges
8. `Input()` - 23 edges
9. `server` - 21 edges
10. `api` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Backend-only Auth (Supabase SDK Removed)` --semantically_similar_to--> `No Supabase SDK Architecture`  [INFERRED] [semantically similar]
  memory-bank/RECENT_INTEGRATIONS.md → CLAUDE.md
- `AI Chat Widget (src/components/ai-chat-widget.tsx)` --semantically_similar_to--> `AI Shopping Assistant — Chat Widget (RAG)`  [INFERRED] [semantically similar]
  CLAUDE.md → memory-bank/RECENT_INTEGRATIONS.md
- `Guest Cart Flow (session id, migrate on login)` --semantically_similar_to--> `Fix 3: guest_session_id Never Cleared After Migration`  [INFERRED] [semantically similar]
  README.md → memory-bank/CART_FUNCTIONALITY_FIXES.md
- `Two-Ledger Mental Model (Variant Stock vs Inventory)` --semantically_similar_to--> `Cart — Two Stock Sources (variant stock vs inventory)`  [INFERRED] [semantically similar]
  memory-bank/CART_FUNCTIONALITY_FIXES.md → README.md
- `Guest Cart Flow (session id, migrate on login)` --semantically_similar_to--> `Migration Tracking Fix (migrationAttempted ref)`  [INFERRED] [semantically similar]
  README.md → memory-bank/INFINITE_API_CALLS_FIX.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Guest Cart Session Lifecycle Fixes** — memory_bank_cart_count_fix_session_id_initialization_fix, memory_bank_cart_functionality_fixes_fix3_guest_session_id_not_cleared, memory_bank_infinite_api_calls_fix_migration_tracking_fix, memory_bank_cart_mutation_analysis_usemigrateguestcart [INFERRED 0.80]
- **Home Page Redesign Iterations** — memory_bank_home_page_with_products_home_page_tsx, memory_bank_home_page_improvements_home_page_tsx, memory_bank_home_page_design_home_page_tsx [INFERRED 0.85]
- **Two-Ledger Stock Model** — memory_bank_cart_functionality_fixes_two_ledger_mental_model, memory_bank_recent_fixes_variants_missing_inventory_rows_backfill, readme_cart_two_stock_sources [INFERRED 0.80]
- **CI Required Checks Gate** — github_workflows_ci_lint_job, github_workflows_ci_typecheck_job, github_workflows_ci_test_job, github_workflows_ci_build_job, github_workflows_ci_all_green_job [EXTRACTED 1.00]
- **Graphify Extraction Pipeline (AST + Semantic + Merge)** — claude_skills_graphify_skill_step3_part_a_ast, claude_skills_graphify_skill_step3_part_b_semantic, claude_skills_graphify_skill_step3_part_c_merge [EXTRACTED 1.00]
- **E2E Money-Critical Flow Specs** — e2e_readme_guest_checkout_spec, e2e_readme_checkout_saved_address_spec, e2e_readme_cart_spec, e2e_readme_auth_spec, e2e_readme_password_reset_spec [EXTRACTED 1.00]

## Communities (195 total, 105 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (46): CartSidePanel(), HeaderProductSearch(), HeaderProductSearchProps, pickSuggestionImage(), CategoryCard, HEX_CLIP, mockUseCategories, InfoPageLayout() (+38 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (49): mockUseCart, mockUseProducts, mockUseToast, mockUseCart, mockUseProducts, mockUseToast, MetaPixelTracker(), baseProduct (+41 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (49): ACCEPTED_MIME_SET, BulkImageUploadDialog(), formatBytes(), newId(), mockUseAdminProducts, mockUseBulkUploadProductImages, mockUseProductVariants, CartItemSizeSelector() (+41 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (28): AboutStoreSection(), ContactUsSection(), FullCollectionBanner(), HeroSection(), NewCollectionSection(), NewsletterBanner(), OurShopSection(), ProductCategorySection() (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (38): mockUseAdminProducts, mockUseBulkCreateVariants, mockUseProduct, useToast(), AdminImagesPage(), AdminProductsPage(), ProductFormData, variantAvailableUnits() (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (31): Cart Count Display Logic Fix, Cart Count Not Showing Bug, Query Enablement Timing Issue, Immediate Session ID Initialization Fix, cart.schema.ts (BE), Fix 2: Cart Migration Always Failing, Fix 3: guest_session_id Never Cleared After Migration, Fix 8: Inventory Queries Not Refreshing After Variant Operations (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (16): AiChatbotIcon(), AiChatbotIconProps, AiChatWidget(), ChatMessage, getOrCreateSessionId(), ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (22): addrStr(), AdminOrderDetailPage(), fulfillmentStatusColors, getCustomerDisplayName(), getCustomerPhoneDisplay(), isSyntheticGuestEmail(), linesFromAddressJson(), LooseAddr (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (24): react, react, NavProjects(), TeamSwitcher(), PROJECTS, TEAMS, Separator(), Sidebar() (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (20): BulkImageUploadDialogProps, QueuedFile, Checkbox, DialogContent, DialogDescription, DialogFooter(), DialogHeader(), DialogOverlay (+12 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (29): DOM, DOM.Iterable, e2e, ES2020, playwright.config.ts, ./src/*, src/components/button-showcase.tsx, compilerOptions (+21 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (20): OAuthSuccessLandingRedirect(), OAuthTokens, consumeOAuthLoginPending(), markOAuthLoginPending(), peekOAuthLoginPending(), ForgotPasswordPage(), mockUseToast, AuthTokenResponse (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.11
Nodes (27): AdminOrdersPage(), getCustomerPhone(), getOrderLineItems(), lineItemSku(), mockUseToast, BulkUpdateOrderStatusParams, CheckoutAddress, CreateGuestOrderParams (+19 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (15): api, AdminDashboardData, mockUseToast, userQueryKeys, useUserOrder(), useUserOrders(), handlers, server (+7 more)

### Community 14 - "Community 14"
Cohesion: 0.09
Nodes (23): getOrderCustomerName(), nameFromAddress(), OrderWithUser, OrderWithUser, AddressType, ApiResponse, CourierTrackingEvent, Inventory (+15 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (19): Badge(), BadgeProps, badgeVariants, Table, TableBody, TableCaption, TableCell, TableFooter (+11 more)

### Community 16 - "Community 16"
Cohesion: 0.19
Nodes (14): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+6 more)

### Community 17 - "Community 17"
Cohesion: 0.16
Nodes (17): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+9 more)

### Community 18 - "Community 18"
Cohesion: 0.19
Nodes (19): apiDownloadFile(), ApiError, apiFetch(), apiFetchForm(), apiFetchList(), ApiListResult, buildError(), camelToSnake() (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.20
Nodes (14): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, formatPrice(), FormatPriceOptions (+6 more)

### Community 20 - "Community 20"
Cohesion: 0.13
Nodes (15): PaginationMeta, AdminInventoryPage(), unwrapRelation(), variantProductName(), computeInventoryStats(), InventoryLevelsResult, InventoryMovement, InventoryMovementsResult (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 22 - "Community 22"
Cohesion: 0.23
Nodes (8): FacebookIconProps, GoogleIcon(), GoogleIconProps, Input(), Label, labelVariants, TODO: Implement Google login, TODO: Implement Facebook login

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (18): AddProductParams, CancelOrderInventoryParams, DecreaseStockParams, invalidateInventory(), InventoryUpdateProductParams, ReserveStockParams, resolveInventoryId(), RestockParams (+10 more)

### Community 24 - "Community 24"
Cohesion: 0.17
Nodes (10): AurevoBlack(), AurevoBlackProps, AurevoWhite(), AurevoWhiteProps, EmailIcon(), EmailIconProps, TikTokIcon(), TikTokIconProps (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.20
Nodes (12): AdminBrandsPage(), mockUseToast, buildBrandFormData(), CreateBrandParams, UpdateBrandParams, useBulkUpdateBrandStatus(), useCreateBrand(), useDeleteBrand() (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.26
Nodes (10): APPAREL_SIZES, ColorRow, EU_SHOE_SIZES, GenerateVariantsDialog(), GenerateVariantsDialogProps, newColorId(), slugifyForSku(), TabsContent (+2 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (11): Layout(), mockUseAuth, mockUseCart, mockUseCategories, mockUseGuestCart, GuestCartContext, GuestCartContextType, GuestCartProviderProps (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.15
Nodes (10): EmailConfirmationPage, ForgotPasswordPage, guestRoutes, LoginPage, RegisterPage, ResetPasswordPage, DashboardAddressesPage, DashboardPage (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.18
Nodes (9): Confidence Score Rubric, Node ID Format Rule, Extraction Subagent Prompt Spec, GEMINI_API_KEY / GOOGLE_API_KEY, general-purpose Subagent (Agent tool), Step 3: Extract Entities and Relationships, Part A: Structural (AST) Extraction, Part B: Semantic Extraction (Subagents) (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.14
Nodes (12): AdminLayout(), mockUseAuth, AdminBrandsPage, AdminCategoriesPage, AdminDashboardPage, AdminImagesPage, AdminInventoryPage, AdminOrderDetailPage (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.22
Nodes (9): AppSidebar(), data, mockUseAuth, Avatar(), AvatarFallback(), AvatarImage(), SidebarFooter(), SidebarGroupContent() (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (7): ProductCombobox(), ProductComboboxProps, mockUseAdminProducts, PopoverContent, useDebouncedValue(), statusColors, VariantFormData

### Community 33 - "Community 33"
Cohesion: 0.27
Nodes (8): OAuthErrorRouteHandler(), humanizeOAuthError(), parseParams(), parseSupabaseOAuthErrorFromUrl(), safeDecode(), stripSupabaseOAuthParamsFromUrl(), LoginPage(), RegisterPage()

### Community 34 - "Community 34"
Cohesion: 0.23
Nodes (11): AdminCategoriesPage(), compareCategoriesBySort(), mockUseToast, buildCategoryFormData(), CreateCategoryParams, UpdateCategoryParams, useBulkUpdateCategoryStatus(), useCreateCategory() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.31
Nodes (7): addSavedAddress(), extractAuthActionLink(), loginAs(), registerTestUser(), seedProductAndVariant(), TEST_ADDRESS, waitForEmail()

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (13): Aurevo.BE (backend, port 5000), Aurevo.UI (frontend, port 5173), auth.spec.ts, authLimiter middleware (Aurevo.BE), cart.spec.ts, checkout-saved-address.spec.ts, E2E Tests (Playwright, local only), fixtures.ts (+5 more)

### Community 37 - "Community 37"
Cohesion: 0.15
Nodes (13): eslint, devDependencies, eslint, @playwright/test, tailwindcss-animate, @types/node, @vitejs/plugin-react, @vitest/coverage-v8 (+5 more)

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (9): NavMain(), ITEMS, Collapsible(), CollapsibleContent(), CollapsibleTrigger(), SidebarGroupLabel(), SidebarMenuSub(), SidebarMenuSubButton() (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.28
Nodes (9): Sheet(), SheetClose(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle() (+1 more)

### Community 40 - "Community 40"
Cohesion: 0.19
Nodes (10): AdminOrdersParams, orderQueryKeys, OrderStats, OrderUser, NOTE: `api.get`/`apiFetch` converts every response key from camelCase to, useOrder(), useOrders(), useOrderStats() (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.17
Nodes (10): GitHub Clone and Cross-Repo Merge, graphify clone, graphify extract (CLI, monorepo), graphify merge-graphs, Transcribe Video and Audio, GRAPHIFY_WHISPER_PROMPT / Model, Step 0: GitHub Repos and Multi-Path Merge, Step 1: Ensure graphify Installed (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.17
Nodes (12): scripts, build, coverage, dev, lint, preview, test, test:e2e (+4 more)

### Community 43 - "Community 43"
Cohesion: 0.26
Nodes (4): CategoryImageField(), CategoryImageFieldProps, Button(), buttonVariants

### Community 44 - "Community 44"
Cohesion: 0.26
Nodes (6): AdminGuard(), AuthGuard(), mockUseAuth, mockUseAuth, useAuth(), EmailConfirmationPage()

### Community 45 - "Community 45"
Cohesion: 0.35
Nodes (7): GuestGuard(), mockUseAuth, mockUseSession, useAuth(), useMeQuery(), useSession(), useUserProfile()

### Community 46 - "Community 46"
Cohesion: 0.24
Nodes (8): AuthContext, AuthProvider(), AuthProviderProps, AuthUser, buildProfileFieldsFromUserMetadata(), pickAvatar(), StoredSession, useClaimGuestOrders()

### Community 47 - "Community 47"
Cohesion: 0.21
Nodes (8): AuthContextType, formatOrderShippingLine(), getProfileCompletion(), ProfileSegment, DashboardPage(), orderItemsSummary(), statusBadgeClass(), UserProfile

### Community 48 - "Community 48"
Cohesion: 0.35
Nodes (9): DashboardAddressesPage(), ADDRESS, AddressInput, addressQueryKeys, useAddresses(), useCreateAddress(), useDeleteAddress(), UserAddress (+1 more)

### Community 49 - "Community 49"
Cohesion: 0.35
Nodes (7): useVariantAvailableQuantity(), useVariantsAvailableQuantities(), AvailabilityRow, computeAvailableUnits(), fetchVariantAvailableQuantity(), fetchVariantsAvailableQuantities(), VariantAvailabilityMap

### Community 50 - "Community 50"
Cohesion: 0.18
Nodes (11): class-variance-authority, clsx, dependencies, class-variance-authority, clsx, @radix-ui/react-separator, @tanstack/react-query, @tanstack/react-query-devtools (+3 more)

### Community 51 - "Community 51"
Cohesion: 0.18
Nodes (10): HomePage(), AboutPage, CheckoutPage, NotFoundPage, OrderConfirmationPage, { PaymentPage, ShippingPage, SupportPage, TrackingPage }, ProductDetailPage, ProductsPage (+2 more)

### Community 52 - "Community 52"
Cohesion: 0.20
Nodes (9): /graphify Trigger Instruction, /graphify add and --watch, graphify.watch module (--watch), Commit Hook and CLAUDE.md Integration, graphify claude install/uninstall, graphify hook install/uninstall/status, graphify (tool), merge-back Job (+1 more)

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (3): #479 Shrink-Guard (to_json refusal), graphify.export.to_json(), Step 4: Build Graph, Cluster, Analyze

### Community 54 - "Community 54"
Cohesion: 0.47
Nodes (9): All Checks Passed Job, Branch Protection Required Checks, Build Job, CI Workflow, Database / Validate migrations check, Lint Job, pnpm, Unit Tests Job (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 56 - "Community 56"
Cohesion: 0.39
Nodes (6): ProductCardProps, ProductCardTitle(), Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger()

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (8): DashboardProfilePage(), toDateInputValue(), authQueryKeys, useCreateUserProfile(), useDeleteAvatar(), useUpdateUserProfile(), useUploadAvatar(), useUserMutations()

### Community 58 - "Community 58"
Cohesion: 0.25
Nodes (6): graphify.detect.save_manifest(), Step 4.5: Graph Health Check, Step 5: Label Communities, Step 6: Generate Obsidian Vault + HTML, Step 9: Save Manifest, Update Cost, Cleanup, Steps 6b-8: Wiki/Neo4j/FalkorDB/SVG/GraphML/MCP/Benchmark

### Community 59 - "Community 59"
Cohesion: 0.25
Nodes (8): index.html Entry Point, Async Inter Font Loading (media=print trick), LCP Hero Image Preload (cover-photo.webp), src/components/ui/button.jsx, components.json, shadcn/ui Setup, pnpm-workspace.yaml allowBuilds config, Tech Stack (React 19, Vite, TS, TanStack Query, Tailwind v4)

### Community 60 - "Community 60"
Cohesion: 0.25
Nodes (6): CART_ITEM, mockUseCart, mockUseGuestCart, mockUseProduct, mockUseToast, mockUseVariantsAvailableQuantities

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (7): No Supabase SDK Architecture, OAuth Redirect Flow (useSignInWithOAuth), /api/auth/me Called On Every Page Bug, src/lib/api.ts, src/contexts/auth-context.tsx, Backend-only Auth (Supabase SDK Removed), src/components/oauth-success-landing-redirect.tsx

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (7): graphify explain CLI, graphify path CLI, graphify query CLI, Query, Path, Explain, graphify reflect / LESSONS.md, graphify save-result (work memory), Constrained Query Expansion (vocab)

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (7): Fix 6: Inventory Showing Stock But Products Still Out of Stock, Fix 7: New Variants Not Appearing In Inventory Admin Page, inventory.service.ts (BE), Two-Ledger Mental Model (Variant Stock vs Inventory), variants.service.ts (BE), 5 Existing Variants Missing Inventory Rows Backfill, Cart — Two Stock Sources (variant stock vs inventory)

### Community 64 - "Community 64"
Cohesion: 0.52
Nodes (4): LanguageSwitcher(), AppLanguage, detectLanguage(), setLanguage()

### Community 65 - "Community 65"
Cohesion: 0.38
Nodes (4): NumberStepper(), NumberStepperProps, Callback, useDebounceCallback()

### Community 66 - "Community 66"
Cohesion: 0.53
Nodes (6): AI Chat Widget (src/components/ai-chat-widget.tsx), src/components/ai-chat-widget.tsx, AI Shopping Assistant — Chat Widget (RAG), src/lib/chat-stream.ts, messenger-chat.tsx (removed), AI Chat Widget (README description)

### Community 67 - "Community 67"
Cohesion: 0.40
Nodes (6): Aurevo.UI CLAUDE.md (document), E2E Tests (Playwright, local only), Recent Fixes & Changes Log (document), Recent Integrations — Aurevo.UI (document), Frontend Testing — Aurevo.UI (document), Aurevo Fashion README.md (document)

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (6): Extra Exports and Benchmark, FalkorDB Export (--falkordb/--falkordb-push), graphify benchmark, graphify.serve module (--mcp), Neo4j Export (--neo4j/--neo4j-push), Wiki Export (--wiki)

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (4): graphify.build.build_merge(), graphify cluster-only, Incremental Update and Cluster-Only, graphify.build.build_from_json()

### Community 70 - "Community 70"
Cohesion: 0.53
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 71 - "Community 71"
Cohesion: 0.40
Nodes (3): Dynamic Categories Service (from static to DB-backed), useCategory(slug), Category Filtering Logic

### Community 72 - "Community 72"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 73 - "Community 73"
Cohesion: 0.50
Nodes (3): NavUser(), mockUseAuth, USER

### Community 74 - "Community 74"
Cohesion: 0.50
Nodes (4): src/routes/AppRoutes.tsx, src/routes/paths.ts (APP_PATHS), useRoutes Declarative Nested Routing Pattern, App.tsx (legacy 22-line clean version)

### Community 75 - "Community 75"
Cohesion: 0.50
Nodes (4): Guest Order Claim On Login, Order Line Items — Product Names, Orders Pagination + Search, orders.service.ts (BE)

### Community 77 - "Community 77"
Cohesion: 0.50
Nodes (4): src/test/msw/server.ts, src/test/setup.ts, Vitest + MSW Testing Setup, Testing (Vitest, Testing Library, MSW, jsdom)

### Community 80 - "Community 80"
Cohesion: 0.67
Nodes (3): Error Boundary (src/components/error-boundary.tsx), Sentry (src/lib/sentry.ts), Observability — Sentry + Error Boundary

### Community 81 - "Community 81"
Cohesion: 0.67
Nodes (3): Fix 9: colorCode Validation Rejecting Empty String, variants.schema.ts (BE), Bulk Create Variants — colorCode Empty String Bug

### Community 82 - "Community 82"
Cohesion: 0.67
Nodes (3): src/pages/home-page.tsx (premium redesign), src/pages/home-page.tsx (dynamic categories), src/pages/home-page.tsx (products+categories rebuild)

### Community 83 - "Community 83"
Cohesion: 0.67
Nodes (3): Context Value Recreation Issue, GuestCartProvider, Memoized Guest Cart Context Fix

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (3): AdminGuard.tsx, adminRoutes.tsx (group), AdminRoutes.tsx (legacy)

### Community 85 - "Community 85"
Cohesion: 0.67
Nodes (3): AuthGuard.tsx, protectedRoutes.tsx (group), ProtectedRoutes.tsx (legacy)

### Community 86 - "Community 86"
Cohesion: 0.67
Nodes (3): lib/api.ts (apiDownloadFile), Server-side XLSX Export, lib/xlsx-export.ts (BE)

### Community 87 - "Community 87"
Cohesion: 0.67
Nodes (3): tsconfig.json, src/types/index.ts, JavaScript to TypeScript Migration

## Ambiguous Edges - Review These
- `Tech Stack (React 19, Vite, TS, TanStack Query, Tailwind v4)` → `LCP Hero Image Preload (cover-photo.webp)`  [AMBIGUOUS]
  index.html · relation: conceptually_related_to

## Knowledge Gaps
- **506 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+501 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **105 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Tech Stack (React 19, Vite, TS, TanStack Query, Tailwind v4)` and `LCP Hero Image Preload (cover-photo.webp)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `cn()` connect `Community 16` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 8`, `Community 9`, `Community 12`, `Community 15`, `Community 17`, `Community 19`, `Community 22`, `Community 26`, `Community 31`, `Community 32`, `Community 38`, `Community 39`, `Community 43`, `Community 47`, `Community 56`, `Community 70`, `Community 78`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 50` to `next-themes Dependency`, `Radix Alert Dialog Dep`, `Radix Avatar Dep`, `Radix Checkbox Dep`, `Radix Collapsible Dep`, `Radix Dialog Dep`, `Radix Dropdown Menu Dep`, `Radix Label Dep`, `Radix Popover Dep`, `Radix Radio Group Dep`, `Radix Select Dep`, `Radix Slot Dep`, `Radix Tabs Dep`, `Radix Tooltip Dep`, `Community 8`, `React DOM Dependency`, `react-i18next Dependency`, `react-markdown Dependency`, `React Router Dependency`, `Sentry React Dependency`, `Sonner Toast Dependency`, `tailwind-merge Dependency`, `Tailwind CSS Dependency`, `Tailwind Vite Plugin Dep`, `Vercel Analytics Dep`, `Vercel Speed Insights Dep`, `Community 72`, `Community 100`, `Community 102`, `Community 107`, `Community 108`, `Community 109`, `Community 111`, `Community 112`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Why does `react` connect `Community 8` to `Community 50`, `Community 3`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _526 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05276907001044932 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07122153209109731 - nodes in this community are weakly interconnected._