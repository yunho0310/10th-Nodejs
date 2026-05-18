import { prisma } from "../../../db.config.js";

// User 데이터 삽입
export const addUser = async (data: any) => {
 // 1. 이미 존재하는 이메일인지 확인
 const user = await prisma.user.findFirst({ where: { email: data.email } });

 if (user) {
  return null;
 }

 // 2. 새로운 유저 생성
 const created = await prisma.user.create({
  data: {
   email: data.email,
   name: data.name,
   nickname: data.nicknaem,
   gender: data.gender,
   birth: data.birth,
   address: data.address,
   detailAddress: data.detailAddress,
   phoneNumber: data.phoneNumber,
  },
 });

 return created.id;
};

export const getUser = async (userId: number) => {
 return await prisma.user.findFirstOrThrow({ where: { id: userId } });
};

// 음식 선호 카테고리 매핑
export const setPreference = async (userId: number, foodCategoryId: number) => {
 await prisma.userFavorCategory.create({
  data: {
   userId: userId,
   // 숫자를 BigInt로 명시적으로 변환 (스키마와 일치시킴)
   foodCategoryId: BigInt(foodCategoryId),
  },
 });
};

// 사용자 선호 카테고리 반환 (JOIN)
export const getUserPreferencesByUserId = async (userId: number) => {
 return await prisma.userFavorCategory.findMany({
  where: { userId: userId },
  include: {
   foodCategory: true, // 💡 핵심: JOIN 대신 include를 써서 연관 데이터를 가져옵니다!
  },
  orderBy: { foodCategoryId: "asc" },
 });
};
