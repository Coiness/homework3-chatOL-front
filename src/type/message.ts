export interface message {
  mid: string
  createdat: number
  uid: string
  chatid: string
  content: string
  type: 'text' | 'image' | 'file'
}
