'use client'

import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields, magicLinkClient, adminClient } from 'better-auth/client/plugins'

const auth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: 'string' },
      },
      session: {
        impersonatedBy: { type: 'string' },
      },
    }),
    adminClient(),
    magicLinkClient(),
  ],
})

export const {
  useSession,
  getSession,
  signUp,
  signIn,
  signOut,
  updateUser,
  changeEmail,
  forgetPassword,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  magicLink,
  admin,
} = auth

export const getUser = async () => {
  const { data, error } = await getSession()
  if (data) return data.user
  throw error
}

export const useUser = () => {
  const { data, error, isPending } = useSession()
  return {
    user: data?.user,
    session: data?.session,
    error,
    isPending,
  }
}
