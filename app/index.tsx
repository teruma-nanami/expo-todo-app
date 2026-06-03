import { View, Text, FlatList, TouchableOpacity } from "react-native"
import { Stack, router } from "expo-router"
import TodoItem from "../components/TodoItem"
import type { Todo } from "../types"

const MOCK_TODOS: Todo[] = [
  { id: "1", title: "牛乳を買う", completed: false, createdAt: "2026-06-03T00:00:00.000Z" },
  { id: "2", title: "ジムに行く", completed: true, createdAt: "2026-06-03T00:00:00.000Z" },
  { id: "3", title: "読書する", completed: false, createdAt: "2026-06-03T00:00:00.000Z" },
]

export default function ListScreen() {
  const todos = MOCK_TODOS

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: "Todoリスト" }} />

      {todos.length === 0 ? (
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
              onToggle={() => {}}
              onPress={() =>
                router.push({ pathname: "/add-edit", params: { id: item.id } })
              }
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
