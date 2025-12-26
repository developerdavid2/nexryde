import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { InputFieldProps } from "@/types/type";

const InputField = ({
  label,
  labelStyle,
  icon,
  secureTextEntry = false,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  iconRight,
  onIconRightPress,
  ...props
}: InputFieldProps) => {
  return (
    <View className="my-2 w-full">
      <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
        {label}
      </Text>
      <View
        className={`flex flex-row justify-start items-center relative bg-neutral-100 rounded-full border border-neutral-100 focus:border-primary-500 ${containerStyle}`}
      >
        {icon && (
          <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
        )}
        <TextInput
          className={`rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
          secureTextEntry={secureTextEntry}
          {...props}
        />
        {iconRight && onIconRightPress && (
          <TouchableOpacity
            onPress={onIconRightPress}
            className="mr-4 py-4"
            activeOpacity={0.7}
          >
            <Image
              source={iconRight}
              className={`w-6 h-6 ${iconStyle}`}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;
