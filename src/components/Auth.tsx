import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import type { user as UserType } from '@/type/user'
import { jsBridge } from '@/lib/jsBridge'
import { useChatStore } from '@/store/useChatStore'

const STORAGE_KEY = 'chat_user_token'

// 简单的 JWT 解析函数（仅用于前端状态恢复，不做验证）
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to parse JWT:', error)
    return null
  }
}

async function loadToken(): Promise<string | null> {
  // 优先从 native 中读 token
  if (jsBridge.isAvailable()) {
    try {
      const t = (await jsBridge.getUserToken()) as string | null | undefined
      if (t) return t
    } catch (error) {
      console.error('从 native 获取 token 失败', error)
    }
  }
  // 回退到 localStorage
  return localStorage.getItem(STORAGE_KEY)
}

export default function Auth() {
  const { user, setUser, logout } = useChatStore()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const t = await loadToken()
      if (!mounted) return
      if (t && !user) {
        // 从 JWT token 中解析用户信息
        const decoded = parseJwt(t)
        if (decoded && decoded.uid) {
          const demoUser: UserType = { uid: decoded.uid, token: t }
          setUser(demoUser)
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [user, setUser])

  async function handleDemoLogin() {
    try {
      // 调用后端登录 API 获取真正的 JWT token
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: `demo-${Date.now()}`, // 生成唯一用户ID
        }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()

      if (data.success && data.token) {
        const demoUser: UserType = {
          uid: data.user.uid,
          token: data.token,
        }

        // 将 user 放入全局 store
        setUser(demoUser)

        // 持久化：优先 native，再写 localStorage 作为回退
        if (jsBridge.isAvailable()) {
          try {
            await jsBridge.setUserToken(data.token)
          } catch (e) {
            console.warn('保存 token 到 native 失败，回退到 localStorage', e)
          }
        }
        localStorage.setItem(STORAGE_KEY, data.token)

        console.log('✅ 登录成功，获取到 JWT token')
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('登录失败:', error)
      alert('登录失败，请检查服务器是否运行')
    }
  }

  async function handleLogout() {
    // 清理 store 与本地存储、native
    logout()
    localStorage.removeItem(STORAGE_KEY)

    if (jsBridge.isAvailable()) {
      try {
        // 如果 native 支持 removeUserToken 会更好；这里写空字符串作为回退
        await jsBridge.setUserToken('')
      } catch (e) {
        console.error('删除失败', e)
      }
    }
  }

  if (user) {
    return (
      <div>
        <div>已登录：{user.uid}</div>
        <div>token：{user.token}</div>
        <button onClick={handleLogout}>退出登录</button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">欢迎登录 Chat App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">未登录</div>
          <button
            onClick={handleDemoLogin}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            立即登录
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
