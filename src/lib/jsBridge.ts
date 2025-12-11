// 定义 Android 注入的全局对象类型
interface AndroidBridge {
  postMessage(message: string): void
}

// 扩展 window 对象，让 TS 知道这些全局变量存在
declare global {
  interface Window {
    AndroidBridge?: AndroidBridge
    AndroidInterface?: AndroidBridge // 兼容旧命名
    __JSB_onMessage?: (response: unknown) => void
  }
}

interface BridgeResponse {
  id: number
  result?: unknown
  error?: {
    code: number
    message: string
  }
}

interface PendingCallback {
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
  timeoutId: number // 使用 number 兼容浏览器环境
}

class JSBridge {
  private requestId = 0
  private pendingCallbacks: { [key: number]: PendingCallback } = {}
  private DEFAULT_TIMEOUT = 30000

  constructor() {
    // 初始化时，挂载全局回调函数供 Android 调用
    if (typeof window !== 'undefined') {
      window.__JSB_onMessage = (response: unknown) => {
        this.handleMessage(response as BridgeResponse)
      }
      console.log('[JSBridge] Initialized, available:', this.isAvailable())
    }
  }

  /**
   * 核心方法：调用 Native 功能
   */
  public call<T = unknown>(method: string, params?: unknown, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      // 1. 检查环境
      if (!this.isAvailable()) {
        // 开发环境下为了不报错，可以模拟一个 log，或者直接 reject
        console.warn(`[JSBridge] Mock call: ${method}`, params)
        // 如果是开发环境想要模拟数据，可以在这里写 mock 逻辑
        // resolve({ mock: true } as unknown);
        reject({ code: -1, message: 'AndroidBridge is not available' })
        return
      }

      // 2. 生成 ID
      const id = ++this.requestId

      // 3. 设置超时
      const timeoutMs = timeout || this.DEFAULT_TIMEOUT
      const timeoutId = window.setTimeout(() => {
        if (this.pendingCallbacks[id]) {
          delete this.pendingCallbacks[id]
          reject({ code: -2, message: 'Request timeout' })
        }
      }, timeoutMs)

      // 4. 存储回调
      this.pendingCallbacks[id] = {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeoutId,
      }

      // 5. 发送消息
      const message = JSON.stringify({
        id,
        method,
        params,
      })

      try {
        window.AndroidBridge!.postMessage(message)
      } catch (e: unknown) {
        clearTimeout(timeoutId)
        delete this.pendingCallbacks[id]
        const errorMessage = e instanceof Error ? e.message : String(e)
        reject({ code: -3, message: `Failed to send message: ${errorMessage}` })
      }
    })
  }

  /**
   * 处理来自 Android 的回调
   */
  private handleMessage(response: BridgeResponse) {
    if (!response || response.id === undefined) {
      console.warn('[JSBridge] Invalid response:', response)
      return
    }

    const callback = this.pendingCallbacks[response.id]
    if (!callback) {
      // 可能是超时了，或者 ID 错误
      return
    }

    clearTimeout(callback.timeoutId)
    delete this.pendingCallbacks[response.id]

    if (response.error) {
      callback.reject(response.error)
    } else {
      callback.resolve(response.result)
    }
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.AndroidBridge !== 'undefined'
  }

  // ================= 业务方法封装 =================

  public getDeviceInfo() {
    return this.call<{ brand: string; model: string }>('getDeviceInfo')
  }

  public echo(data: unknown) {
    return this.call('echo', data)
  }

  public getUserToken() {
    return this.call('getUserToken')
  }

  public setUserToken(token: string) {
    return this.call('setUserToken', token)
  }
}

// 导出单例
export const jsBridge = new JSBridge()
