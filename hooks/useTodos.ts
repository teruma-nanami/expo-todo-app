import { useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Crypto from "expo-crypto"
import type { Todo } from "../types"

const STORAGE_KEY = "todos"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  const loadTodos = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY)
      setTodos(json ? JSON.parse(json) : [])
    } catch (e) {
      console.error("AsyncStorage 読み込みエラー:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveTodos = async (next: Todo[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (e) {
      console.error("AsyncStorage 書き込みエラー:", e)
    }
  }

  const addTodo = async (title: string) => {
    const newTodo: Todo = {
      id: Crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }
    const next = [...todos, newTodo]
    setTodos(next)
    await saveTodos(next)
  }

  const updateTodo = async (id: string, title: string) => {
    const next = todos.map((t) => t.id === id ? { ...t, title: title.trim() } : t)
    setTodos(next)
    await saveTodos(next)
  }

  const toggleTodo = async (id: string) => {
    const next = todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
    setTodos(next)
    await saveTodos(next)
  }

  const deleteTodo = async (id: string) => {
    const next = todos.filter((t) => t.id !== id)
    setTodos(next)
    await saveTodos(next)
  }

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  return { todos, loading, loadTodos, addTodo, updateTodo, toggleTodo, deleteTodo }
}
