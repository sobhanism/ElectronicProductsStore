<template>
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content auth-modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isLoginMode ? 'ورود به حساب کاربری' : 'ثبت‌نام' }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label for="username">نام کاربری</label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              placeholder="نام کاربری خود را وارد کنید"
              required
            />
          </div>

          <div v-if="!isLoginMode" class="form-group">
            <label for="email">ایمیل</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="ایمیل خود را وارد کنید"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">رمز عبور</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="رمز عبور (حداقل 4 کاراکتر)"
              required
              minlength="4"
            />
          </div>

          <button type="submit" class="btn-primary submit-btn" :disabled="authStore.isLoading">
            {{ authStore.isLoading ? 'در حال پردازش...' : isLoginMode ? 'ورود' : 'ثبت‌نام' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            {{ isLoginMode ? 'حساب کاربری ندارید؟' : 'قبلاً ثبت‌نام کرده‌اید؟' }}
            <button @click="toggleMode" class="link-button">
              {{ isLoginMode ? 'ثبت‌نام کنید' : 'وارد شوید' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth-store'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const authStore = useAuthStore()
const isLoginMode = ref(true)
const showModal = ref(props.show)

const formData = ref({
  username: '',
  email: '',
  password: '',
})

watch(
  () => props.show,
  (newValue) => {
    showModal.value = newValue
  },
)

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  authStore.error = null
  formData.value = {
    username: '',
    email: '',
    password: '',
  }
}

const closeModal = () => {
  showModal.value = false
  authStore.error = null
  emit('close')
}

const handleSubmit = async () => {
  let result

  if (isLoginMode.value) {
    result = await authStore.login(formData.value.username, formData.value.password)
  } else {
    result = await authStore.register(
      formData.value.username,
      formData.value.email,
      formData.value.password,
    )
  }

  if (result.success) {
    formData.value = {
      username: '',
      email: '',
      password: '',
    }
    emit('success')
    closeModal()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-modal {
  max-width: 450px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  line-height: 1;
  padding: 0;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
  font-size: 0.9rem;
}

.submit-btn {
  margin-top: 0.5rem;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.auth-footer p {
  color: #6b7280;
  margin: 0;
}

.link-button {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  padding: 0;
  margin-left: 0.25rem;
}

.link-button:hover {
  color: #764ba2;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
