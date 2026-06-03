import { View, Text } from "react-native"
import { Stack } from "expo-router"

export default function AddEditScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Stack.Screen options={{ title: "追加・編集" }} />
      <Text className="text-gray-400 text-base">追加・編集画面（#8 で実装）</Text>
    </View>
  )
}
