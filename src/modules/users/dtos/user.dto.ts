// 1. 회원가입 요청 데이터의 설계도
export interface UserSignUpRequest {
  email: string;
  password: string; //추가
  name: string;
  gender: string;
  birth: string;
  address?: string;
  detailAddress?: string;
  phoneNumber: string;
  preferences: number[];
}

export interface UserSignUpResponse {
  email: string;
  name: string;
  preferCategory: string[]; // 카테고리 이름 리스트 (문자열 배열)
}

// 2. 요청받은 데이터를 서비스용 데이터로 변환
export const bodyToUser = (body: UserSignUpRequest) => {
  return {
    email: body.email,
    name: body.name,
    gender: body.gender,
    birth: new Date(body.birth),
    address: body.address || "",
    detailAddress: body.detailAddress || "",
    phoneNumber: body.phoneNumber,
    preferences: body.preferences,
  };
};

// 3. 결과 데이터를 클라이언트에게 보여줄 형식으로 변환

export const responseFromUser = (data: {
  user: any;
  preferences: any[];
}): UserSignUpResponse => {
  const perferCategory = data.preferences.map((p) => p.foodCategory.name);

  return {
    email: data.user.email,
    name: data.user.name,
    preferCategory: perferCategory,
  };
};
