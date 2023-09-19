import { ChangeEvent, useEffect, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { imageDB } from '@/firebase'
import { v4 } from 'uuid'
import { useForm } from 'react-hook-form'
import { TCreateBirdSchema, createBirdSchema } from '@/lib/validations/bird'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bird, Specie } from '@/lib/types'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import noImage from '@/assets/no-image.avif'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Check, ChevronsUpDown, Shell } from 'lucide-react'
import axios from 'axios'
import { useToast } from '../ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { cn, generateRandomHexCode } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command'
import { ScrollArea } from '../ui/scroll-area'

type Props = {
  bird?: Bird
  btnTitle: string
}

const code = generateRandomHexCode()

function CreateBirdForm({ bird, btnTitle }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [species, setSpecies] = useState<Specie[]>([])

  useEffect(() => {
    const fetchSpecies = async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/species?pagination=false`)

      setSpecies(data?.species || [])
    }
    fetchSpecies()
  }, [])

  const form = useForm<TCreateBirdSchema>({
    resolver: zodResolver(createBirdSchema),
    defaultValues: {
      imageUrls: bird?.imageUrls ? JSON.stringify(bird.imageUrls) : '',
      description: bird?.description ? bird.description : '',
      name: bird?.name ? bird.name : code,
      achievements: bird?.achievements ? JSON.stringify(bird.achievements) : '',
      birth: bird?.birth ? bird.birth : undefined,
      discount: bird?.discount ? JSON.stringify(bird.discount) : '',
      gender: bird?.gender ? bird.gender : 'male',
      onSale: bird?.onSale ? bird.onSale : true,
      parent: bird?.parent ? JSON.stringify(bird.parent) : '',
      price: bird?.price ? bird.price : undefined,
      specie: bird?.specie ? (bird.specie as string) : ''
    }
  })

  const onSubmit = async (values: TCreateBirdSchema) => {
    setIsSubmitting(true)
    try {
      let imageUrls: string[] = []
      const image = files[0]
      if (image) {
        const imageRef = ref(imageDB, `images/${image.name + v4()}`)
        await uploadBytes(imageRef, image)
        imageUrls = [await getDownloadURL(imageRef)]
      }

      await axios.post(`${import.meta.env.VITE_API_URL}/api/birds`, {
        ...values,
        imageUrls
      })

      toast({
        variant: 'success',
        title: 'Tạo loài mới thành công'
      })

      navigate('/admin/birds')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const messageError = error.response.data.message
      toast({
        variant: 'destructive',
        title: messageError
      })
      setIsSubmitting(false)
    }
  }

  const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    e.preventDefault()

    const fileReader = new FileReader()

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFiles(Array.from(e.target.files))

      if (!file.type.includes('image')) return

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || ''
        fieldChange(imageDataUrl)
      }

      fileReader.readAsDataURL(file)
    }
  }

  return (
    <Form {...form}>
      <form className='flex flex-col justify-start gap-10' onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='specie'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Loài*</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      aria-expanded={open}
                      variant='outline'
                      role='combobox'
                      className={cn('w-[200px] justify-between', !field.value && 'text-muted-foreground')}
                    >
                      {field.value ? species.find((specie) => specie._id === field.value)?.name : 'Chọn loài'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder='Search framework...' />
                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className='max-h-96'>
                        {species.map((specie) => (
                          <CommandItem
                            value={specie.name}
                            key={specie._id}
                            onSelect={() => {
                              setOpen(false)
                              form.setValue('specie', specie._id)
                              form.setValue('name', specie.name + ' mã ' + code)
                            }}
                          >
                            <Check
                              className={cn('mr-2 h-4 w-4', specie._id === field.value ? 'opacity-100' : 'opacity-0')}
                            />
                            {specie.name}
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='font-bold text-light-2'>Tên*</FormLabel>
              <FormControl>
                <Input disabled type='hidden' className='account-form_input no-focus' {...field} />
              </FormControl>
              <div className='flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300'>
                {form.getValues('name')}
              </div>
              <FormDescription>Tên được tạo tự động</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='imageUrls'
          render={({ field }) => (
            <FormItem className='flex items-center gap-4'>
              <FormLabel className=''>
                <div className='font-bold text-light-2 mb-4'>Ảnh</div>
                {field.value ? (
                  <img
                    src={field.value}
                    alt='imageUrl'
                    width={240}
                    height={240}
                    className='rounded-md object-contain'
                  />
                ) : (
                  <img src={noImage} alt='imageUrl' width={240} height={240} className='object-contain rounded-md' />
                )}
              </FormLabel>
              <FormControl className='flex-1 font-bold text-gray-200'>
                <Input
                  type='file'
                  accept='image/*'
                  placeholder='Add profile photo'
                  className='hidden'
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='font-bold text-light-2'>Mô tả</FormLabel>
              <FormControl>
                <Textarea rows={10} className='account-form_input no-focus' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isSubmitting} type='submit'>
          {btnTitle}
          {isSubmitting && <Shell className='ml-1 animate-spin w-4 h-4' />}
        </Button>
      </form>
    </Form>
  )
}

export default CreateBirdForm
