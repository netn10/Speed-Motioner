import { useEffect, useState } from 'react'
import io from 'socket.io-client'

export const useSocket = () => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
    })

    newSocket.on('disconnect', () => {
    })

    newSocket.on('connect_error', (error) => {
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  return socket
}
