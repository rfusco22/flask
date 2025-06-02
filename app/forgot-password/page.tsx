import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </main>
  )
}
