import { defineStore } from 'pinia'

export type Product = {
  id: string
  name: string
  discount: number
  price: number
  active: boolean
  coverImage: string
  images: string[]
  category?: string
  description?: string
}

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    isLoading: false,
    error: null as string | null,
    selectedCategory: null as string | null,
  }),

  getters: {
    // محصولات فعال (active)
    activeProducts: (state) => {
      return state.products.filter((product) => product.active)
    },

    // محصولات با تخفیف
    discountedProducts: (state) => {
      return state.products.filter((product) => product.discount > 0)
    },

    // محصولات بر اساس دسته‌بندی
    productsByCategory: (state) => {
      if (!state.selectedCategory) {
        return state.products
      }
      return state.products.filter((product) => product.category === state.selectedCategory)
    },

    // تعداد کل محصولات
    totalProducts: (state) => state.products.length,

    // تعداد محصولات فعال
    activeProductsCount(): number {
      return this.activeProducts.length
    },

    // محاسبه میانگین قیمت محصولات
    averagePrice: (state) => {
      if (state.products.length === 0) return 0
      const total = state.products.reduce((sum, product) => sum + product.price, 0)
      return total / state.products.length
    },

    // بیشترین تخفیف
    maxDiscount: (state) => {
      if (state.products.length === 0) return 0
      return Math.max(...state.products.map((p) => p.discount))
    },

    // دسته‌بندی‌های موجود
    availableCategories: (state) => {
      const categories = state.products
        .map((p) => p.category)
        .filter((c): c is string => c !== undefined)
      return [...new Set(categories)]
    },

    // پیدا کردن محصول با ID
    getProductById: (state) => {
      return (id: string) => state.products.find((p) => p.id === id)
    },

    // جستجو در محصولات
    searchProducts: (state) => {
      return (query: string) => {
        const lowerQuery = query.toLowerCase()
        return state.products.filter((product) => product.name.toLowerCase().includes(lowerQuery))
      }
    },

    // مرتب‌سازی محصولات بر اساس قیمت
    productsSortedByPrice: (state) => {
      return (ascending: boolean = true) => {
        return [...state.products].sort((a, b) => {
          return ascending ? a.price - b.price : b.price - a.price
        })
      }
    },

    // محصولات با قیمت نهایی (بعد از تخفیف)
    productsWithFinalPrice: (state) => {
      return state.products.map((product) => ({
        ...product,
        finalPrice: product.price - (product.price * product.discount) / 100,
      }))
    },
  },

  actions: {
    // دریافت محصولات از API
    async fetchProducts() {
      this.isLoading = true
      this.error = null

      try {
        const response = await fetch('/products.json')
        if (!response.ok) {
          throw new Error('خطا در دریافت محصولات')
        }
        const data = await response.json()

        // تبدیل id به string
        this.products = data.products.map((product: Product & { id: number | string }) => ({
          ...product,
          id: product.id.toString(),
        }))
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'خطا در دریافت محصولات'
        console.error('خطا در دریافت محصولات:', error)
      } finally {
        this.isLoading = false
      }
    },

    // افزودن محصول جدید (برای پنل ادمین)
    async addProduct(product: Omit<Product, 'id'>) {
      this.isLoading = true
      this.error = null

      try {
        // شبیه‌سازی درخواست API
        await new Promise((resolve) => setTimeout(resolve, 500))

        const newProduct: Product = {
          ...product,
          id: Date.now().toString(),
        }

        this.products.push(newProduct)
        return { success: true, product: newProduct }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'خطا در افزودن محصول'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // به‌روزرسانی محصول
    async updateProduct(id: string, updates: Partial<Product>) {
      this.isLoading = true
      this.error = null

      try {
        // شبیه‌سازی درخواست API
        await new Promise((resolve) => setTimeout(resolve, 500))

        const index = this.products.findIndex((p) => p.id === id)
        if (index !== -1) {
          const updatedProduct = { ...this.products[index], ...updates } as Product
          this.products[index] = updatedProduct
          return { success: true, product: updatedProduct }
        } else {
          throw new Error('محصول یافت نشد')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'خطا در به‌روزرسانی محصول'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // حذف محصول
    async deleteProduct(id: string) {
      this.isLoading = true
      this.error = null

      try {
        // شبیه‌سازی درخواست API
        await new Promise((resolve) => setTimeout(resolve, 500))

        const index = this.products.findIndex((p) => p.id === id)
        if (index !== -1) {
          this.products.splice(index, 1)
          return { success: true }
        } else {
          throw new Error('محصول یافت نشد')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'خطا در حذف محصول'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // تنظیم دسته‌بندی برای فیلتر
    setCategory(category: string | null) {
      this.selectedCategory = category
    },

    // فیلتر محصولات بر اساس محدوده قیمت
    filterByPriceRange(min: number, max: number) {
      return this.products.filter((product) => product.price >= min && product.price <= max)
    },
  },
})
