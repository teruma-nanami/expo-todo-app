import { View, Text, TouchableOpacity } from "react-native"
import Swipeable from "react-native-gesture-handler/Swipeable"
import type { Todo } from "../types"

type TodoItemProps = {
  todo: Todo
  onToggle: () => void
  onPress: () => void
  onDelete: () => void
}

export default function TodoItem({ todo, onToggle, onPress, onDelete }: TodoItemProps) {
  const renderRightActions = () => (
    <TouchableOpacity
      onPress={onDelete}
      className="bg-red-500 justify-center items-center rounded-xl mb-3 ml-2"
      style={{ width: 72 }}
    >
      <Text className="text-white font-semibold text-sm">削除</Text>
    </TouchableOpacity>
  )

  return (
    <Swipeable renderRightActions={renderRightActions} friction={2} overshootRight={false}>
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
    </Swipeable>
  )
}
