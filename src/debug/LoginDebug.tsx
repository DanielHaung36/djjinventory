// 临时调试组件，用于测试登录流程
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useGetProfileQuery } from '@/features/auth/authApi';

const LoginDebug: React.FC = () => {
  const user = useAppSelector(state => state.auth.user);
  const token = useAppSelector(state => state.auth.token);
  const { data: profileData, isLoading, isError, error } = useGetProfileQuery();
  const [logs, setLogs] = useState<string[]>([]);

  // 记录状态变化
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] Redux User: ${user ? 'EXISTS' : 'NULL'}, Profile Loading: ${isLoading}, Profile Error: ${isError}`;
    setLogs(prev => [...prev.slice(-9), logEntry]); // 只保留最近10条
  }, [user, isLoading, isError]);

  const clearLogs = () => setLogs([]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h2>🔍 Authentication Debug Panel</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>📊 Redux State:</h3>
        <p><strong>User:</strong> {user ? 'EXISTS' : 'NULL'}</p>
        {user && (
          <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '10px', maxHeight: '100px', overflow: 'auto' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        )}
        <p><strong>Token:</strong> {token || 'NULL'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🌐 Profile Query Status:</h3>
        <p><strong>Loading:</strong> <span style={{ color: isLoading ? 'orange' : 'green' }}>{isLoading ? 'TRUE' : 'FALSE'}</span></p>
        <p><strong>Error:</strong> <span style={{ color: isError ? 'red' : 'green' }}>{isError ? 'TRUE' : 'FALSE'}</span></p>
        {error && (
          <p><strong>Error Details:</strong> <span style={{ color: 'red' }}>{JSON.stringify(error)}</span></p>
        )}
        <p><strong>Profile Data:</strong> {profileData ? 'EXISTS' : 'NULL'}</p>
        {profileData && (
          <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '10px', maxHeight: '100px', overflow: 'auto' }}>
            {JSON.stringify(profileData, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🍪 Cookies:</h3>
        <p><strong>All cookies:</strong> {document.cookie || 'NONE'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>📋 State Change Log:</h3>
        <button onClick={clearLogs} style={{ marginBottom: '10px' }}>Clear Logs</button>
        <div style={{ background: '#f0f0f0', padding: '10px', height: '150px', overflow: 'auto' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>{log}</div>
          ))}
        </div>
      </div>

      <div>
        <h3>🎯 Current Auth Status:</h3>
        <p style={{ 
          fontSize: '14px', 
          padding: '10px', 
          background: user ? '#d4edda' : '#f8d7da',
          color: user ? '#155724' : '#721c24',
          border: `1px solid ${user ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          {user ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}
        </p>
      </div>
    </div>
  );
};

export default LoginDebug;