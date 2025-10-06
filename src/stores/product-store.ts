import { defineStore } from 'pinia'
type Product = {
  id: string
  name: string
  discount: number
  price: number
  active: boolean
  coverImage: string
  images: string[]
}
export const useProductStore = defineStore('products', {
  state: () => ({
    products: [] as Product[],
  }),
  getters: {},
  actions: {
    async fetchProducts() {
      try {
        const response = await fetch('/products.json')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        this.products = data.products
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    },
  },
})
