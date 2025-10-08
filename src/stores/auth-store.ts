import { defineStore } from 'pinia'
import { useCartStore } from './cart-store'

export interface User {
  id: string
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    // بررسی اینکه آیا کاربر لاگین کرده یا نه
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null,

    // دریافت نام کاربر
    username: (state) => state.user?.username || '',

    // دریافت ایمیل کاربر
    userEmail: (state) => state.user?.email || '',
  },

  actions: {
    // لاگین کاربر
    async login(username: string, password: string) {
      this.isLoading = true
      this.error = null

      try {
        // شبیه‌سازی درخواست API
        // در پروژه واقعی باید به سرور متصل شوید
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // بررسی اعتبارسنجی ساده (در پروژه واقعی از سرور بررسی می‌شود)
        if (username && password.length >= 4) {
          const user: User = {
            id: '1',
            username: username,
            email: `${username}@example.com`,
          }

          this.user = user
          this.isAuthenticated = true

          // بارگذاری سبد خرید کاربر از سرور
          await this.loadUserCart(user.id)

          // ذخیره اطلاعات کاربر در localStorage
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('isAuthenticated', 'true')

          return { success: true }
        } else {
          throw new Error('نام کاربری یا رمز عبور نامعتبر است')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'خطا در ورود'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // خروج از حساب کاربری
    async logout() {
      this.isLoading = true

      try {
        // شبیه‌سازی درخواست API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // ذخیره سبد خرید قبل از خروج
        if (this.user) {
          await this.saveUserCart(this.user.id)
        }

        // پاک کردن اطلاعات کاربر
        this.user = null
        this.isAuthenticated = false
        this.error = null

        // پاک کردن localStorage
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')

        // پاک کردن سبد خرید
        const cartStore = useCartStore()
        cartStore.clearCart()

        return { success: true }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'خطا در خروج'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // بررسی وضعیت لاگین از localStorage
    checkAuth() {
      const savedUser = localStorage.getItem('user')
      const savedAuth = localStorage.getItem('isAuthenticated')

      if (savedUser && savedAuth === 'true') {
        this.user = JSON.parse(savedUser)
        this.isAuthenticated = true

        // بارگذاری سبد خرید کاربر
        if (this.user) {
          this.loadUserCart(this.user.id)
        }
      }
    },

    // بارگذاری سبد خرید کاربر از سرور
    async loadUserCart(userId: string) {
      try {
        // شبیه‌سازی درخواست API برای دریافت سبد خرید کاربر
        await new Promise((resolve) => setTimeout(resolve, 500))

        const savedCart = localStorage.getItem(`cart_${userId}`)
        if (savedCart) {
          const cartStore = useCartStore()
          cartStore.loadCart(JSON.parse(savedCart))
        }
      } catch (error) {
        console.error('خطا در بارگذاری سبد خرید:', error)
      }
    },

    // ذخیره سبد خرید کاربر در سرور
    async saveUserCart(userId: string) {
      try {
        // شبیه‌سازی درخواست API برای ذخیره سبد خرید
        await new Promise((resolve) => setTimeout(resolve, 500))

        const cartStore = useCartStore()
        localStorage.setItem(`cart_${userId}`, JSON.stringify(cartStore.cart))
      } catch (error) {
        console.error('خطا در ذخیره سبد خرید:', error)
      }
    },

    // ثبت‌نام کاربر جدید
    async register(username: string, email: string, password: string) {
      this.isLoading = true
      this.error = null

      try {
        // شبیه‌سازی درخواست API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // بررسی اعتبارسنجی ساده
        if (username && email.includes('@') && password.length >= 4) {
          const user: User = {
            id: Date.now().toString(),
            username: username,
            email: email,
          }

          this.user = user
          this.isAuthenticated = true

          // ذخیره اطلاعات کاربر در localStorage
          localStorage.setItem('user', JSON.stringify(user))
          localStorage.setItem('isAuthenticated', 'true')

          return { success: true }
        } else {
          throw new Error('اطلاعات وارد شده نامعتبر است')
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'خطا در ثبت‌نام'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },
  },
})
