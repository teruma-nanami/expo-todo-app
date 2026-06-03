import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { Stack, router, useLocalSearchParams } from "expo-router"
import { useState, useEffect } from "react"
import { useTodos } from "../hooks/useTodos"

export default function AddEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const { todos } = useTodos()
  const [title, setTitle] = useState("")
  const [error, setError] = useState("")

  const isEdit = !!id

  useEffect(() => {
    if (id) {
      const todo = todos.find((t) => t.id === id)
      if (todo) setTitle(todo.title)
    }
  }, [id, todos])

  const handleSave = () => {
    if (!title.trim()) {
      setError("タイトルを入力してください")
      return
    }
    // 保存処理は #9 で実装
    router.back()
  }

  return (
    <View className="flex-1 bg-white px-5" style={{ paddingTop: 24 }}>
      <Stack.Screen options={{ title: isEdit ? "Todoを編集" : "Todoを追加" }} />

      <Text className="text-sm font-medium text-gray-600" style={{ marginBottom: 6 }}>タイトル</Text>
      <TextInput
        value={title}
        onChangeText={(text) => {
          setTitle(text)
          if (error) setError("")
        }}
        placeholder="例: 牛乳を買う"
        placeholderTextColor="#9ca3af"
        autoFocus
        className="border border-gray-300 rounded-xl text-base text-gray-800 bg-gray-50"
        style={{ paddingHorizontal: 16, paddingVertical: 14 }}
      />
      {error ? (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleSave}
        className="mt-6 bg-blue-500 rounded-xl py-4 items-center"
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-base">保存</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-3 py-4 items-center"
        activeOpacity={0.8}
      >
        <Text className="text-gray-400 text-base">キャンセル</Text>
      </TouchableOpacity>
    </View>
  )
}
