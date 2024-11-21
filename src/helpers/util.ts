import * as bcrypt from 'bcrypt';
const saltRounds = 10;

export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    return await bcrypt.hash(plainPassword, saltRounds);
  } catch (error) {
    console.error('error', error);
  }
};

export const comparePasswordHelper = async (
  plainPassword: string,
  hashPassword: string,
) => {
  try {
    return await bcrypt.compare(plainPassword, hashPassword);
  } catch (error) {
    console.error('error', error);
  }
};


export const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

// Biểu thức chính quy kiểm tra số điện thoại (chỉ cho phép số và tối thiểu 10 ký tự)
export const phoneRegex = /^[0-9]{10}$/; // Chỉnh sửa theo định dạng số điện thoại của quốc gia của bạn
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;