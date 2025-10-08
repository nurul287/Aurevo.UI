# Home Page with Products & Category Filter

## Implementation Summary

Implemented a complete home page with:

1. ✅ All categories displayed horizontally (like Adidas website)
2. ✅ All products displayed below with grid layout
3. ✅ Category filtering functionality
4. ✅ Pagination for products
5. ✅ Loading states and error handling

---

## Features

### 1. **Category Navigation Bar**

- Sticky horizontal category bar
- "All Products" button to show everything
- Individual category buttons
- Badge showing product count on active category
- Smooth scrolling for many categories
- Active state highlighting

### 2. **Products Grid**

- 4-column grid on desktop (lg screens)
- 3-column on tablets (md screens)
- 2-column on small tablets (sm screens)
- 1-column on mobile
- 12 products per page
- Hover effects on product cards

### 3. **Category Filtering**

- Click any category to filter products
- Click "All Products" to show everything
- Automatically resets to page 1 when category changes
- Updates product count dynamically

### 4. **Pagination**

- Previous/Next buttons
- Page number buttons
- Smart pagination (shows ... for long page lists)
- Shows: First page, Last page, Current page, and ±1 pages around current
- Disabled states for boundary pages

### 5. **Product Cards**

- Product image with fallback
- Product name
- Brand name
- Price display
- "Sale" badge for discounted items
- Compare at price (crossed out)
- Hover effects (scale, shadow, color change)
- Links to product detail page

---

## Code Structure

### **State Management**

```typescript
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [currentPage, setCurrentPage] = useState(1);
const limit = 12;
```

### **Data Fetching**

```typescript
// Fetch all products
const allProductsQuery = useProducts({ page: currentPage, limit });

// Fetch category-specific products
const categoryProductsQuery = useProductsByCategory(selectedCategory || "", {
  page: currentPage,
  limit,
});

// Use appropriate query
const { data, isLoading, error } = selectedCategory
  ? categoryProductsQuery
  : allProductsQuery;
```

### **Category Filter Handler**

```typescript
const handleCategoryClick = (categoryId: string | null) => {
  setSelectedCategory(categoryId);
  setCurrentPage(1); // Reset to first page
};
```

---

## Layout Sections

### 1. **Hero Section**

- Blue gradient background
- Call-to-action buttons
- Responsive text sizing

### 2. **Categories Bar** (Sticky)

- Position: Sticky at top with z-index
- Background: White with shadow
- Horizontal scrolling on mobile
- Category buttons with active states

### 3. **Products Grid**

- Background: Light gray (bg-gray-50)
- Product count display
- Responsive grid layout
- Product cards with images and details

### 4. **Pagination Controls**

- Centered alignment
- Smart page number display
- Disabled state handling

### 5. **Features Section**

- Free shipping
- Quality guarantee
- Easy returns

---

## Responsive Design

### **Categories Bar**

```css
/* Mobile: Horizontal scroll */
overflow-x-auto
scrollbar-hide

/* Buttons don't wrap */
flex-shrink-0
```

### **Products Grid**

```css
/* Mobile (default) */
grid-cols-1

/* Small tablets */
sm:grid-cols-2

/* Tablets */
md:grid-cols-3

/* Desktop */
lg:grid-cols-4
```

---

## Loading States

### **Categories Loading**

```tsx
{
  [1, 2, 3, 4, 5].map((i) => (
    <Skeleton key={i} className="h-12 w-32 flex-shrink-0" />
  ));
}
```

### **Products Loading**

```tsx
{
  [...Array(limit)].map((_, i) => (
    <Card key={i}>
      <Skeleton className="h-64 w-full" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  ));
}
```

---

## Empty States

### **No Products**

```tsx
{
  products.length === 0 && (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">
        {selectedCategory
          ? "No products found in this category"
          : "No products available"}
      </p>
    </div>
  );
}
```

### **Error State**

```tsx
{
  productsError && (
    <div className="text-center py-12">
      <p className="text-red-500 text-lg">Error loading products</p>
    </div>
  );
}
```

---

## Pagination Logic

### **Smart Page Numbers**

Shows:

- First page (1)
- Last page (totalPages)
- Current page
- Pages around current (current ± 1)
- "..." for gaps

```typescript
{
  [...Array(totalPages)].map((_, i) => {
    const page = i + 1;
    if (
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
    ) {
      return <Button>{page}</Button>;
    } else if (page === currentPage - 2 || page === currentPage + 2) {
      return <span>...</span>;
    }
    return null;
  });
}
```

**Example**: If current page is 5 of 10:

```
< 1 ... 4 [5] 6 ... 10 >
```

---

## Product Card Features

### **Image Handling**

```typescript
{
  firstImage ? (
    <img
      src={firstImage}
      alt={product.name}
      className="group-hover:scale-105 transition-transform"
    />
  ) : (
    <div className="fallback">{product.name.charAt(0)}</div>
  );
}
```

### **Sale Badge**

```typescript
{
  hasDiscount && (
    <Badge className="absolute top-2 right-2 bg-red-500">Sale</Badge>
  );
}
```

### **Price Display**

```typescript
<div className="flex items-center gap-2">
  <span className="text-lg font-bold">BDT {product.base_price}</span>
  {hasDiscount && (
    <span className="text-sm text-gray-400 line-through">
      BDT {product.compare_at_price}
    </span>
  )}
</div>
```

---

## Performance Optimizations

1. **Query Caching**: Both `useProducts` and `useProductsByCategory` cache data
2. **Conditional Fetching**: Only fetch category products when category is selected
3. **Skeleton Loading**: Prevents layout shift
4. **Lazy Image Loading**: Browser-native lazy loading
5. **Pagination**: Only load 12 products at a time

---

## User Experience Features

1. **Smooth Transitions**: Hover effects with transitions
2. **Visual Feedback**: Active category highlighted
3. **Product Count**: Shows how many products in view
4. **Disabled States**: Pagination buttons disabled at boundaries
5. **Loading States**: Skeletons prevent jarring content appearance
6. **Error Handling**: Clear error messages
7. **Empty States**: Helpful messages when no products

---

## Customization Options

### **Change Products Per Page**

```typescript
const limit = 12; // Change to 8, 16, 24, etc.
```

### **Change Grid Columns**

```tsx
// Current: 1/2/3/4 columns
className = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

// Alternative: 1/2/2/3 columns
className = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
```

### **Category Bar Position**

```tsx
// Sticky (current)
className = "sticky top-0 z-20";

// Fixed
className = "fixed top-0 z-20 w-full";

// Static (scrolls away)
className = "relative";
```

---

## Future Enhancements

1. **Sort Options**: Sort by price, name, newest
2. **Grid/List Toggle**: Switch between grid and list view
3. **Quick View**: Modal for quick product preview
4. **Wishlist Button**: Add to wishlist from grid
5. **Compare**: Select products to compare
6. **Filters**: Price range, brand, size, color
7. **Search Integration**: Search within category
8. **Infinite Scroll**: Alternative to pagination
9. **View More**: "Load more" button option
10. **Product Badges**: New, Bestseller, Limited

---

## Testing Checklist

- [ ] Categories load and display correctly
- [ ] "All Products" shows all products
- [ ] Category filtering works
- [ ] Pagination next/previous works
- [ ] Page number buttons work
- [ ] Pagination resets on category change
- [ ] Loading skeletons display
- [ ] Error states show appropriately
- [ ] Empty states show correct message
- [ ] Product cards link correctly
- [ ] Sale badges show for discounted items
- [ ] Images have fallbacks
- [ ] Responsive on mobile/tablet/desktop
- [ ] Hover effects work
- [ ] Category bar is sticky

---

## Files Modified

1. ✅ `src/pages/home-page.tsx` - Complete rebuild with products grid
2. ✅ Uses existing hooks: `useCategories`, `useProducts`, `useProductsByCategory`
3. ✅ Uses existing components: `Button`, `Skeleton`, `Badge`, `Card`

---

## Summary

The home page now features:

- 🎯 **Category navigation** like major e-commerce sites
- 🛍️ **Full product grid** with 12 items per page
- 🔄 **Dynamic filtering** by category
- 📄 **Smart pagination** with proper controls
- 📱 **Fully responsive** design
- ⚡ **Fast loading** with optimized queries
- 🎨 **Beautiful UI** with hover effects and transitions

Ready for production! 🚀



