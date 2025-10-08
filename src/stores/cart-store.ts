import { defineStore } from 'pinia'
import { useProductStore } from './product-store'

export type CartItem = {
  productId: string
  productName: string
  count: number
  price?: number
  discount?: number
}

export type ProductCart = { items: CartItem[] }

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: { items: [] } as ProductCart,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    // تعداد کل آیتم‌ها در سبد خرید
    itemCount: (state) => {
      return state.cart.items.reduce((total, item) => total + item.count, 0)
    },

    // مجموع قیمت سبد خرید (با احتساب تخفیف)
    totalPrice: (state) => {
      const productStore = useProductStore()
      return state.cart.items.reduce((total, item) => {
        const product = productStore.products.find((p) => p.id === item.productId)
        if (!product) return total

        const discountedPrice = product.price - (product.price * product.discount) / 100
        return total + discountedPrice * item.count
      }, 0)
    },

    // مجموع قیمت اصلی (بدون تخفیف)
    totalOriginalPrice: (state) => {
      const productStore = useProductStore()
      return state.cart.items.reduce((total, item) => {
        const product = productStore.products.find((p) => p.id === item.productId)
        return product ? total + product.price * item.count : total
      }, 0)
    },

    // مجموع تخفیف
    totalDiscount(): number {
      return this.totalOriginalPrice - this.totalPrice
    },

    // لیست محصولات با جزئیات کامل
    cartItemsWithDetails: (state) => {
      const productStore = useProductStore()
      return state.cart.items.map((item) => {
        const product = productStore.products.find((p) => p.id === item.productId)
        return {
          ...item,
          product: product || null,
        }
      })
    },

    // بررسی خالی بودن سبد خرید
    isEmpty: (state) => state.cart.items.length === 0,
  },

  actions: {
    // افزودن محصول به سبد خرید
    addToCart(productId: string, productName: string) {
      const existingItem = this.cart.items.find((item) => item.productId === productId)
      if (existingItem) {
        existingItem.count++
      } else {
        this.cart.items.push({ productId, productName, count: 1 })
      }

      // ذخیره سبد خرید در localStorage
      this.saveCartToLocalStorage()
    },

    // کاهش تعداد محصول در سبد خرید
    decreaseFromCart(productId: string) {
      const existingItem = this.cart.items.find((item) => item.productId === productId)
      if (existingItem) {
        if (existingItem.count > 1) {
          existingItem.count--
        } else {
          // حذف آیتم اگر تعداد به 0 رسید
          this.removeFromCart(productId)
        }
      }

      // ذخیره سبد خرید در localStorage
      this.saveCartToLocalStorage()
    },

    // حذف محصول از سبد خرید
    removeFromCart(productId: string) {
      const itemIndex = this.cart.items.findIndex((item) => item.productId === productId)
      if (itemIndex !== -1) {
        this.cart.items.splice(itemIndex, 1)
      }

      // ذخیره سبد خرید در localStorage
      this.saveCartToLocalStorage()
    },

    // به‌روزرسانی تعداد محصول
    updateQuantity(productId: string, count: number) {
      const existingItem = this.cart.items.find((item) => item.productId === productId)
      if (existingItem) {
        if (count <= 0) {
          this.removeFromCart(productId)
        } else {
          existingItem.count = count
        }
      }

      // ذخیره سبد خرید در localStorage
      this.saveCartToLocalStorage()
    },

    // پاک کردن کل سبد خرید
    clearCart() {
      this.cart.items = []

      // ذخیره سبد خرید در localStorage
      this.saveCartToLocalStorage()
    },

    // دریافت تعداد یک محصول خاص در سبد
    getProductCount(productId: string): number {
      const item = this.cart.items.find((item) => item.productId === productId)
      return item ? item.count : 0
    },

    // بارگذاری سبد خرید (برای زمانی که کاربر لاگین می‌کند)
    loadCart(cart: ProductCart) {
      this.cart = cart
    },

    // ذخیره سبد خرید در localStorage
    saveCartToLocalStorage() {
      try {
        localStorage.setItem('cart', JSON.stringify(this.cart))
      } catch (error) {
        console.error('خطا در ذخیره سبد خرید:', error)
      }
    },

    // بارگذاری سبد خرید از localStorage
    loadCartFromLocalStorage() {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          this.cart = JSON.parse(savedCart)
        }
      } catch (error) {
        console.error('خطا در بارگذاری سبد خرید:', error)
      }
    },

    // همگام‌سازی سبد خرید با سرور (شبیه‌سازی)
    async syncCartWithServer(userId: string) {
      this.isLoading = true
      this.error = null

      try {
        // شبیه‌سازی درخواست API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // در پروژه واقعی، اینجا باید سبد خرید را با سرور همگام‌سازی کنید
        const savedCart = localStorage.getItem(`cart_${userId}`)
        if (savedCart) {
          this.cart = JSON.parse(savedCart)
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'خطا در همگام‌سازی سبد خرید'
        console.error('خطا در همگام‌سازی سبد خرید:', error)
      } finally {
        this.isLoading = false
      }
    },

    // ذخیره سبد خرید در سرور (شبیه‌سازی)
    async saveCartToServer(userId: string) {
      this.isLoading = true
      this.error = null

      try {
        // شبیه‌سازی درخواست API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // در پروژه واقعی، اینجا باید سبد خرید را به سرور ارسال کنید
        localStorage.setItem(`cart_${userId}`, JSON.stringify(this.cart))
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'خطا در ذخیره سبد خرید'
        console.error('خطا در ذخیره سبد خرید:', error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
