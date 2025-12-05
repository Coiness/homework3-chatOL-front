/**
 * 压缩图片
 * @param file 原始文件
 * @param maxWidth 最大宽度
 * @param quality 图片质量 (0-1)
 * @returns Promise<string> 压缩后的 Base64 字符串
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.6
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // 计算缩放比例
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // 转换为 JPEG 格式以获得更好的压缩率
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedBase64)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
