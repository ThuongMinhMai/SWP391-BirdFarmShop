import { Button } from '@/components/ui/button'
import Container from '@/components/ui/container'
import { useCartContext } from '@/contexts/cart-provider'
import { Products, Voucher } from '@/lib/types'
import { birdFarmApi } from '@/services/bird-farm-api'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import noImage from '@/assets/no-image.webp'
import { addSearchParams, calculateDiscount, formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { useAuthContext } from '@/contexts/auth-provider'
import { useNavigate } from 'react-router-dom'
import Spinner from '@/components/ui/spinner'
import greyBirdIcon from '@/assets/grey-bird.svg'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'
import VoucherTicket from '@/components/voucher-ticket'
import { ScrollArea } from '@/components/ui/scroll-area'

function Cart() {
  const { cart, removeBirdFromCart, removeNestFromCart } = useCartContext()
  const [products, setProducts] = useState<Products>({ birds: [], nests: [] })
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [totalMoney, setTotalMoney] = useState(0)
  const { toast } = useToast()
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true)
      const birdsData = birdFarmApi.post('/api/birds/get-by-ids', { birds: cart.birds }).then((res) => res.data.birds)
      const nestsData = birdFarmApi.post('/api/nests/get-by-ids', { nests: cart.nests }).then((res) => res.data.nests)

      const [birds, nests] = await Promise.all([birdsData, nestsData])

      setProducts({ birds, nests })
      setIsLoadingProducts(false)
    }

    fetchProducts()
  }, [cart])

  useEffect(() => {
    const fetchVouchers = async () => {
      const { data } = await birdFarmApi.get('/api/vouchers')

      setVouchers(data.vouchers || [])
    }

    fetchVouchers()
  }, [])

  useEffect(() => {
    let temp = 0

    products.birds.forEach((bird) => {
      temp += bird.sellPrice
    })

    products.nests.forEach((nest) => {
      temp += nest.price
    })

    setTotalMoney(temp)
  }, [products, cart])

  return (
    <main>
      <Container>
        <section className='container px-5 my-7'>
          <div className='flex justify-center gap-2 '>
            <span className='text-2xl uppercase '>Giỏ HÀNG </span>
            <span className='text-2xl '>{'>'}</span>
            <span className='text-2xl text-gray-500 uppercase'>Chi tiết thanh toán</span>
          </div>

          <div className='flex w-full gap-10 mt-10'>
            <div className='flex justify-center flex-1 gap-10 '>
              <div className='flex flex-col w-full'>
                <Table className=''>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='font-bold text-center'>Ảnh</TableHead>
                      <TableHead className='font-bold'>Sản phẩm </TableHead>
                      <TableHead className='font-bold text-center'>Loại sản phẩm </TableHead>
                      <TableHead className='font-bold text-center'>Giá</TableHead>
                      <TableHead className='font-bold'>Xóa</TableHead>
                    </TableRow>
                  </TableHeader>

                  {!isLoadingProducts && (
                    <TableBody>
                      {products?.birds.map((bird) => {
                        return (
                          <TableRow key={bird._id}>
                            <TableCell className='font-medium'>
                              <img
                                src={bird?.imageUrls?.[0] || noImage}
                                alt=''
                                className='h-[70px] w-[70px] object-cover rounded-lg mx-auto border'
                              />
                            </TableCell>
                            <TableCell>{bird.name}</TableCell>
                            <TableCell className='text-center'>Chim kiểng</TableCell>
                            <TableCell className='text-center'>{formatPrice(bird.sellPrice)}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() => {
                                  removeBirdFromCart(bird._id)
                                }}
                                size='icon'
                                variant='ghost'
                              >
                                <Trash2 />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      {products?.nests.map((nest) => {
                        return (
                          <TableRow key={nest._id}>
                            <TableCell className='font-medium'>
                              <img
                                src={nest?.imageUrls?.[0] || noImage}
                                alt=''
                                className='h-[70px] w-[70px] object-cover rounded-lg mx-auto border'
                              />
                            </TableCell>
                            <TableCell>{nest.name}</TableCell>
                            <TableCell className='text-center'>Tổ chim non</TableCell>
                            <TableCell className='text-center'>{formatPrice(nest.price)}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() => {
                                  removeNestFromCart(nest._id)
                                }}
                                size='icon'
                                variant='ghost'
                              >
                                <Trash2 />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  )}
                </Table>

                {!isLoadingProducts && !products?.birds.length && !products.nests.length && (
                  <div className='flex flex-col items-center justify-center mx-auto mt-6 text-lg font-medium'>
                    Giỏ hàng rỗng <img src={greyBirdIcon} className='w-16 h-16 mt-4' />
                  </div>
                )}
                {isLoadingProducts && <Spinner className='mt-8' />}
              </div>
            </div>
            <div className='min-w-[300px]'>
              <h1 className='text-lg font-bold text-center uppercase'>Đơn hàng</h1>
              <div className='flex m-auto mt-5'>
                <span className='w-1/2 font-bold text-start'>Tạm tính</span>
                <span className='w-1/2 font-bold text-end'>
                  {isLoadingProducts ? <Skeleton className='float-right h-5 w-28' /> : formatPrice(totalMoney)}
                </span>
              </div>
              <div className='flex m-auto mt-5'>
                <span className='w-1/2 font-bold text-start'>Giảm giá</span>
                <span className='w-1/2 font-bold text-end'>
                  {isLoadingProducts ? (
                    <Skeleton className='float-right h-5 w-28' />
                  ) : selectedVoucher ? (
                    formatPrice(calculateDiscount(totalMoney, selectedVoucher, user?._id))
                  ) : (
                    formatPrice(0)
                  )}
                </span>
              </div>

              {selectedVoucher && <VoucherTicket context={false} className='mt-4' voucher={selectedVoucher} />}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className='w-full mt-4' variant='outline'>
                    {!selectedVoucher ? 'Chọn voucher' : 'Chọn voucher khác'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Chọn voucher</AlertDialogTitle>
                    <AlertDialogDescription>
                      <ScrollArea>
                        <div className='flex flex-col max-h-[50vh] pr-4 mt-2 mb-4 gap-3'>
                          {vouchers
                            .sort((a: Voucher, b: Voucher) => {
                              return (
                                calculateDiscount(totalMoney, b, user?._id) -
                                calculateDiscount(totalMoney, a, user?._id)
                              )
                            })
                            .map((voucher, index) => {
                              return (
                                <div className='flex items-center w-full gap-4'>
                                  <VoucherTicket
                                    contextContent={
                                      totalMoney < voucher.conditionPrice
                                        ? 'Không đủ điều kiện'
                                        : index === 0
                                        ? 'Lựa chọn tốt nhất'
                                        : 'Số lượng có hạn'
                                    }
                                    key={voucher._id}
                                    voucher={voucher}
                                  />
                                  <Button disabled={calculateDiscount(totalMoney, voucher, user?._id) <= 0} asChild>
                                    <AlertDialogCancel onClick={() => setSelectedVoucher(voucher)}>
                                      Lưu
                                    </AlertDialogCancel>
                                  </Button>
                                </div>
                              )
                            })}
                        </div>
                      </ScrollArea>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Trở lại</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className='m-auto mt-4 border'></div>
              <div className='flex m-auto mt-5'>
                <span className='w-1/2 font-bold text-start'>Tổng</span>
                <span className='w-1/2 font-bold text-end'>
                  {isLoadingProducts ? (
                    <Skeleton className='float-right h-5 w-28' />
                  ) : selectedVoucher ? (
                    formatPrice(totalMoney - calculateDiscount(totalMoney, selectedVoucher, user?._id))
                  ) : (
                    formatPrice(totalMoney)
                  )}
                </span>
              </div>

              <div className='m-auto mt-4'>
                <Button
                  className='w-full'
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: 'Hãy đăng nhập để tiếp tục mua hàng',
                        variant: 'destructive'
                      })
                      navigate('/auth/sign-in')
                      return
                    }
                    if (cart.birds.length === 0 && cart.nests.length === 0) {
                      toast({
                        title: 'Không thể mua hàng',
                        description: 'Giỏ hàng rỗng',
                        variant: 'destructive'
                      })
                      return
                    }

                    navigate(addSearchParams('/checkout-order', { voucher: selectedVoucher?._id }))
                  }}
                >
                  Mua hàng
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Container>
    </main>
  )
}

export default Cart
