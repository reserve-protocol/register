import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import type React from 'react' // Import React

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'

import { dtfFormSchema, type DTFFormValues } from './schema'

const categoryTags = [
  { type: 'Memes', selected: false },
  { type: 'AI', selected: false },
  { type: 'DeFi', selected: false },
  { type: 'L2s', selected: false },
]

export default function ManageDTF() {
  const [previewImage, setPreviewImage] = useState<string>('')

  const form = useForm<DTFFormValues>({
    resolver: zodResolver(dtfFormSchema),
    defaultValues: {
      categoryTags,
      creatorLink: 'https://',
      curatorLink: 'https://',
      twitterLink: 'https://',
      telegramLink: 'https://',
      discordLink: 'https://',
      websiteLink: 'https://',
    },
  })

  const onSubmit = async (data: DTFFormValues) => {
    console.log(data)
    // Handle form submission
  }

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: any
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        field.onChange(reader.result)
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex gap-6 p-6 max-w-7xl mx-auto">
      <Form {...form}>
        <div className="flex gap-6 w-full">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-4"
          >
            <Accordion type="single" collapsible defaultValue="about">
              {/* About Section */}
              <AccordionItem value="about">
                <AccordionTrigger>About</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="dtfIcon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DTF Icon</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, field)}
                                className="hidden"
                                id="dtf-icon"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="w-full"
                              >
                                <label
                                  htmlFor="dtf-icon"
                                  className="cursor-pointer"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Icon
                                </label>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>DTF Category Tags</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {categoryTags.map((tag, index) => (
                          <FormField
                            key={tag.type}
                            control={form.control}
                            name={`categoryTags.${index}.selected`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="!mt-0">
                                  {tag.type}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="aboutDtf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About this DTF</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Creator Section */}
              <AccordionItem value="creator">
                <AccordionTrigger>Creator</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="creatorImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creator Image</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, field)}
                                className="hidden"
                                id="creator-image"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="w-full"
                              >
                                <label
                                  htmlFor="creator-image"
                                  className="cursor-pointer"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                </label>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="creatorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creator Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="creatorLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Creator Link</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Curator Section */}
              <AccordionItem value="curator">
                <AccordionTrigger>Curator</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="curatorImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Curator Image</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, field)}
                                className="hidden"
                                id="curator-image"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="w-full"
                              >
                                <label
                                  htmlFor="curator-image"
                                  className="cursor-pointer"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                </label>
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="curatorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Curator Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="curatorLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Curator Link</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* DTF Socials Section */}
              <AccordionItem value="socials">
                <AccordionTrigger>DTF Socials</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="twitterLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter/X Link</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telegramLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telegram Link</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discordLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discord Link</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="websiteLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website Link</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button type="submit" className="w-full">
              Submit all changes
            </Button>
          </form>

          {/* Preview Section */}
          <Card className="w-[400px] h-fit sticky top-6">
            <CardContent className="p-6">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage || '/placeholder.svg'}
                    alt="Preview"
                    width={400}
                    height={400}
                    className="rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setPreviewImage('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Upload preview image
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Form>
    </div>
  )
}
