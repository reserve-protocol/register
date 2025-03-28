export const tryLoadImage = async (
  url: string | Promise<string>
): Promise<string> => {
  const src = await Promise.resolve(url)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = src

    const timeoutId = setTimeout(() => {
      reject(new Error('Image load timeout'))
    }, 5000)

    img.onload = () => {
      clearTimeout(timeoutId)
      resolve(url)
    }

    img.onerror = () => {
      clearTimeout(timeoutId)
      reject()
    }
  })
}
