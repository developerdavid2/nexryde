import { View, Text } from "react-native";
import CustomButton from "@/components/CustomButton";
import { PaymentProps } from "@/types/type";

// This version is a "dummy" that prevents the crash during web/static export
const Payment = ({ amount }: PaymentProps) => {
  return (
    <View className="my-10">
      <CustomButton
        title={`Pay $${amount} (Mobile Only)`}
        onPress={() => alert("Payments are only available on the mobile app.")}
      />
      <Text className="text-center text-gray-400 mt-2">
        Stripe is not supported on Web
      </Text>
    </View>
  );
};

export default Payment;
