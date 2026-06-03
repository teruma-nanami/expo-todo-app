import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { Stack, router, useFocusEffect } from "expo-router"
import { useCallback } from "react"
import TodoItem from "../components/TodoItem"
import { useTodos } from "../hooks/useTodos"

export default function ListScreen() {
  const { todos, loading, loadTodos, toggleTodo, deleteTodo } = useTodos()

  useFocusEffect(useCallback(() => {
    loadTodos()
  }, [loadTodos]))

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: "Todoリスト" }} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : todos.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-1">
          <Text className="text-gray-400 text-base">Todoがありません</Text>
          <Text className="text-gray-300 text-sm">右下の＋ボタンから追加しましょう</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onToggle={() => toggleTodo(item.id)}
              onPress={() =>
                router.push({ pathname: "/add-edit", params: { id: item.id } })
              }
              onDelete={() => deleteTodo(item.id)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96 }}
        />
      )}

      <TouchableOpacity
        onPress={() => router.push("/add-edit")}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-blue-500 items-center justify-center"
        style={{ elevation: 4 }}
        activeOpacity={0.8}
      >
        <Text className="text-white text-4xl leading-none mt-[-2px]">+</Text>
      </TouchableOpacity>
    </View>
  )
}
