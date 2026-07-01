import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useSocket(countryCode, { onNewComment, onDeleteComment, onUpdateReactions, onEditComment }) {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!countryCode) return

    socketRef.current = io(SOCKET_URL)
    socketRef.current.emit('join_country', countryCode)

    socketRef.current.on('new_comment', (comment) => {
      onNewComment?.(comment)
    })

    socketRef.current.on('delete_comment', ({ id }) => {
      onDeleteComment?.(id)
    })

    socketRef.current.on('update_reactions', (data) => {
      onUpdateReactions?.(data)
    })

    socketRef.current.on('edit_comment', ({ id, content }) => {
      onEditComment?.({ id, content })
    })

    return () => {
      socketRef.current.emit('leave_country', countryCode)
      socketRef.current.disconnect()
    }
  }, [countryCode])

  return socketRef
}