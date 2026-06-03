import { useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Todo } from "../types"

const STORAGE_KEY = "todos"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  const loadTodos = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY)
      if (json) setTodos(JSON.parse(json))
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

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  return { todos, loading, saveTodos, setTodos }
}
