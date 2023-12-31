import Container from '@/components/ui/container'
import voucherIcon from '@/assets/voucher.svg'
import { User } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cn, roleToVi } from '@/lib/utils'
import { useAuthContext } from '@/contexts/auth-provider'
import addressIcon from '@/assets/address.svg'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { birdFarmApi } from '@/services/bird-farm-api'

function LayoutUser() {
  const { user } = useAuthContext()
  const activeTab = useLocation().pathname.split('/')[2]
  const navigate = useNavigate()
  const [defaultAvatarUrl, setDefaultAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedia = async () => {
      const { data } = await birdFarmApi.get('/api/media')
      setDefaultAvatarUrl(data.media.defaultAvatarUrl)
    }

    fetchMedia()
  }, [])

  if (user && user.role === 'guest') {
    navigate('/')
  }

  return (
    <main>
      <Container>
        <div className='flex mt-12'>
          <div className='w-[220px] shrink-0'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center mb-4 gap-3'>
                <Avatar className='w-12 h-12 cursor-pointer border-2 border-primary'>
                  <AvatarImage src={user?.imageUrl || defaultAvatarUrl || 'https://github.com/shadcn.png'} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium'>{user?.name}</p>
                  <p className='text-sm'>{roleToVi[user?.role || 'guest']}</p>
                </div>
              </div>

              <div className='flex items-center'>
                <User className='w-7 h-7 mr-2' />
                <Link
                  className={cn(
                    `hover:text-primary rounded-md text-lg font-medium`,
                    activeTab === 'profile' && 'text-primary'
                  )}
                  to='/user/profile'
                >
                  Hồ sơ
                </Link>
              </div>
              {user?.role === 'customer' && (
                <>
                  <div className='flex items-center'>
                    <img src={addressIcon} className='w-7 h-7 mr-2 dark:filter dark:invert' />
                    <Link
                      className={cn(
                        `hover:text-primary rounded-md text-lg font-medium`,
                        activeTab === 'addresses' && 'text-primary'
                      )}
                      to='/user/addresses'
                    >
                      Địa chỉ
                    </Link>
                  </div>
                  <div className='flex items-center'>
                    <img src={voucherIcon} className='w-7 h-7 mr-2 dark:filter dark:invert' />
                    <Link
                      className={cn(
                        `hover:text-primary rounded-md text-lg font-medium`,
                        activeTab === 'vouchers' && 'text-primary'
                      )}
                      to='/user/vouchers'
                    >
                      Kho vouchers
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className='flex-1 bg-muted p-8 rounded-md'>
            <div>
              <Outlet />
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}

export default LayoutUser
