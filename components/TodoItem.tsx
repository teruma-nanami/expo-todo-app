import { View, Text, TouchableOpacity } from "react-native"
import type { Todo } from "../types"

type TodoItemProps = {
  todo: Todo
  onToggle: () => void
  onPress: () => void
}

export default function TodoItem({ todo, onToggle, onPress }: TodoItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl px-4 py-4 mb-3 flex-row items-center shadow-sm"
      activeOpacity={0.7}
    >
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
          todo.completed ? "bg-blue-500 border-blue-500" : "border-gray-300"
        }`}
      >
        {todo.completed && (
          <Text className="text-white text-xs font-bold">✓</Text>
        )}
      </TouchableOpacity>
      <Text
        className={`flex-1 text-base ${
          todo.completed ? "line-through text-gray-400" : "text-gray-800"
        }`}
      >
        {todo.title}
      </Text>
    </TouchableOpacity>
  )
}
