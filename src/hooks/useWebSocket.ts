// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react'

// 全局WebSocket实例，避免多实例问题
let globalWebSocket: WebSocket | null = null;
const globalListeners = new Set<(message: WebSocketMessage) => void>();
let globalConnectionState = false;
let globalUrl: string | null = null;

// 立即建立WebSocket连接的函数
function initializeGlobalWebSocket(url: string) {
  if (globalWebSocket?.readyState === WebSocket.OPEN && globalUrl === url) {
    console.log('🔄 [WebSocket] 连接已存在，跳过初始化');
    return;
  }
  
  // 如果有现有连接但URL不同或状态不对，先关闭
  if (globalWebSocket) {
    console.log('🔄 [WebSocket] 关闭现有连接');
    globalWebSocket.close();
  }
  
  console.log('🚀 [WebSocket] 初始化全局WebSocket连接:', url);
  globalUrl = url;
  
  try {
    const wsUrl = url.replace(/^https?/, 'wss');
    globalWebSocket = new WebSocket(wsUrl);

    globalWebSocket.onopen = () => {
      console.log('🔌 [WebSocket] 全局连接成功:', wsUrl);
      globalConnectionState = true;
      
      // 通知所有监听器连接状态改变
      notifyConnectionChange(true);
    };

    globalWebSocket.onmessage = (event) => {
      try {
        console.log('🔥 [WebSocket] 收到原始事件:', event);
        console.log('🔥 [WebSocket] 原始数据:', event.data);
        
        const rawMessage = JSON.parse(event.data);
        console.log('📨 [WebSocket] 收到原始消息:', rawMessage);
        
        const message: WebSocketMessage = {
          type: rawMessage.type || rawMessage.event || 'unknown',
          data: rawMessage.data || rawMessage.payload || rawMessage,
          timestamp: rawMessage.timestamp || new Date().toISOString()
        };
        
        console.log('📨 [WebSocket] 转换后消息:', message);
        console.log('🎯 [WebSocket] 广播到所有监听器，监听器数量:', globalListeners.size);
        
        // 广播消息到所有监听器
        globalListeners.forEach(listener => {
          try {
            listener({...message, _timestamp: Date.now()});
          } catch (error) {
            console.error('❌ [WebSocket] 监听器错误:', error);
          }
        });
      } catch (error) {
        console.error('❌ [WebSocket] 消息解析失败:', error);
        console.error('❌ [WebSocket] 原始数据:', event.data);
      }
    };

    globalWebSocket.onclose = (event) => {
      console.log('🔌 [WebSocket] 全局连接断开:', event.code, event.reason);
      globalConnectionState = false;
      
      // 通知所有监听器连接状态改变
      notifyConnectionChange(false);
      
      // 自动重连
      if (event.code !== 1000) { // 不是正常关闭
        console.log('🔄 [WebSocket] 5秒后尝试重连...');
        setTimeout(() => {
          initializeGlobalWebSocket(url);
        }, 5000);
      }
    };

    globalWebSocket.onerror = (error) => {
      console.error('❌ [WebSocket] 连接错误:', error);
      globalConnectionState = false;
      notifyConnectionChange(false);
    };
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
  }
}

// 连接状态监听器
const connectionListeners = new Set<(connected: boolean) => void>();

function notifyConnectionChange(connected: boolean) {
  connectionListeners.forEach(listener => {
    try {
      listener(connected);
    } catch (error) {
      console.error('❌ [WebSocket] 连接状态监听器错误:', error);
    }
  });
}

// 应用启动时立即初始化WebSocket连接
const WEBSOCKET_URL = `${import.meta.env.VITE_API_HOST.replace(/^https/, 'wss').replace(/^http/, 'ws')}/ws/inventory`;
if (typeof window !== 'undefined') {
  console.log('🚀 [WebSocket] 应用启动时准备初始化WebSocket...');
  // 延迟一点点，确保DOM加载完成
  setTimeout(() => {
    try {
      console.log('🚀 [WebSocket] 开始初始化WebSocket连接...');
      initializeGlobalWebSocket(WEBSOCKET_URL);
    } catch (error) {
      console.error('❌ [WebSocket] 自动初始化失败:', error);
    }
  }, 1000); // 增加延迟时间
}

interface WebSocketMessage {
  type: string
  data: any
  timestamp: string
}

interface UseWebSocketReturn {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (message: any) => void
  connect: () => void
  disconnect: () => void
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  const connect = () => {
    initializeGlobalWebSocket(url);
  }

  const disconnect = () => {
    // 全局连接，不在这里关闭
  }

  const sendMessage = (message: any) => {
    if (globalWebSocket?.readyState === WebSocket.OPEN) {
      globalWebSocket.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  // 立即注册监听器（不等待useEffect）
  const messageListener = (message: WebSocketMessage) => {
    console.log('🎯 [useWebSocket] 监听器收到消息:', message);
    setLastMessage(message);
  }
  
  const connectionListener = (connected: boolean) => {
    console.log('🎯 [useWebSocket] 连接状态变化:', connected);
    setIsConnected(connected);
  }

  // 注册监听器
  useEffect(() => {
    console.log('🎯 [useWebSocket] 组件挂载，注册监听器');
    
    // 确保全局连接存在
    if (!globalWebSocket || globalWebSocket.readyState !== WebSocket.OPEN) {
      console.log('🎯 [useWebSocket] 初始化WebSocket连接');
      initializeGlobalWebSocket(url);
    }
    
    // 注册监听器
    globalListeners.add(messageListener);
    connectionListeners.add(connectionListener);
    
    // 设置初始状态
    setIsConnected(globalConnectionState);
    
    console.log('🎯 [useWebSocket] 监听器注册完成，当前数量:', globalListeners.size);
    console.log('🎯 [useWebSocket] 当前连接状态:', globalConnectionState);
    
    return () => {
      console.log('🎯 [useWebSocket] 组件卸载，移除监听器');
      globalListeners.delete(messageListener);
      connectionListeners.delete(connectionListener);
    }
  }, [url]) // 恢复url依赖，确保正确初始化

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  }
}