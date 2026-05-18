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

 // 1. 유저 정보 저장 (addUser 내부의 findFirst 로직 실행)
 const joinUserId = await addUser({
  ...data,
  password: h_password,
  birth: new Date(data.birth),
 });

 // 여기서 null이 반환되면 바로 에러를 던져서 아래 로직을 실행하지 못하게 함
 if (joinUserId === null) {
  throw new DuplicateUserEmailError("이미 존재하는 이메일입니다.", data);
 }

 // 2. 선호 카테고리 매핑
 const uniquePreferences = [...new Set(data.preferences)];
 for (const preferenceId of uniquePreferences) {
  await setPreference(joinUserId, preferenceId);
 }

 // 3. 결과 반환을 위한 데이터 조회
 const userId = joinUserId;
 const preferences = (await getUserPreferencesByUserId(joinUserId)).map(
  (p) => p.foodCategory?.name,
 );

 return <UserSignUpResponse>{ userId, preferences };
};
