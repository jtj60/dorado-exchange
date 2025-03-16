import React from 'react'
import { authClient } from '@/lib/authClient'
import { User2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUserStore } from '@/store/useUserStore'

export default function ProfileTrigger() {
  const { user } = useUserStore()

  return (
    <div className="flex items-center">
      {user ? (
        <Avatar>
          <AvatarFallback className='bg-background text-muted-foreground'>
            <User2 />
          </AvatarFallback>
        </Avatar>
      ) : null}
    </div>
  )
}
