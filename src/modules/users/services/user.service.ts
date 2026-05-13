import bcrypt from "bcrypt";
import { UserSignUpRequest, UserSignUpResponse } from "../dtos/user.dto.js";
import {
 addUser,
 getUser,
 getUserPreferencesByUserId,
 setPreference,
} from "../repositories/user.repository.js";
import {
 DuplicateUserEmailError,
 HashingPassword,
} from "../../../common/errors/error.js";

export const userSignUp = async (
 data: UserSignUpRequest,
): Promise<UserSignUpResponse> => {
 const hn = 10;

 const h_password = await bcrypt.hash(data.password, hn);
 if (h_password == null) {
  throw new HashingPassword("비밀번호 암호화 중 오류가 발생하였습니다.", data);
 }

 // 1. 유저 정보 저장
 const joinUserId = await addUser({ ...data, password: h_password });

 if (joinUserId === null) {
  throw new DuplicateUserEmailError("이미 존재하는 이메일입니다.", data);
 }

 // 2. 선호 카테고리 매핑 (for...of 사용 권장)
 for (const preferenceId of data.preferences) {
  await setPreference(joinUserId, preferenceId);
 }

 const userId = joinUserId;
 const preferences = (await getUserPreferencesByUserId(joinUserId)).map(
  (p) => p.foodCategory.name,
 );

 return <UserSignUpResponse>{ userId, preferences };
};
