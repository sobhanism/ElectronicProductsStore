import { defineStore } from 'pinia'
import { useProductStore } from './product-store'
export type ProductCart = { items: { productId: string; productName: string; count: number }[] }

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: { items: [] } as ProductCart,
  }),
  getters: {
    itemCount: (state) => {
      return state.cart.items.reduce((total, item) => total + item.count, 0)
    },
    totalPrice: (state) => {
      const productStore = useProductStore()
      return state.cart.items.reduce((total, item) => {
        const product = productStore.products.find((p) => p.id === item.productId)
        return product ? total + product.price * item.count : total
      }, 0)
    },
  },
  actions: {
    addToCart(productId: string, productName: string) {
      const existingItem = this.cart.items.find((item) => item.productId === productId)
      if (existingItem) {
        existingItem.count++
      } else {
        this.cart.items.push({ productId, productName, count: 1 })
      }
    },
    decreaseFromCart(productId: string) {
      const existingItem = this.cart.items.find((item) => item.productId === productId)
      if (existingItem) {
        if (existingItem.count > 1) {
          existingItem.count--
        } else {
          // Remove item if count reaches 0
          this.removeFromCart(productId)
        }
      }
    },
    removeFromCart(productId: string) {
      const itemIndex = this.cart.items.findIndex((item) => item.productId === productId)
      if (itemIndex !== -1) {
        this.cart.items.splice(itemIndex, 1)
      }
    },
    clearCart() {
      this.cart.items = []
    },
    getProductCount(productId: string): number {
      const item = this.cart.items.find((item) => item.productId === productId)
      return item ? item.count : 0
    },
  },
})
