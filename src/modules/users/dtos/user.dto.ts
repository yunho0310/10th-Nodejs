import { setPreference } from "../repositories/user.repository.js";

// [기존 코드] 일반 회원가입 요청 데이터 구조
export interface UserSignUpRequest {
    email: string;
    password: string;
    name: string;
    gender: string;
    birth: Date;
    address?: string;
    detailAddress?: string;
    phoneNumber: string;
    preferences: number[];
}

// [기존 코드] 일반 회원가입 응답 구조
export interface UserSignUpResponse {
    userId: number;
    preferences: string[];
}

// ==========================================
// 🔥 [새로 추가할 소셜 로그인 추가 정보 규격]
// ==========================================
export interface SocialAdditionalInfoRequest {
    userId: number; // 구글 로그인 연동 시 먼저 생성되었던 유저의 고유 ID(PK)
    name?: string; // 이름 (선택적 변경 가능)
    nickname?: string; // 닉네임 (추가)
    email?: string; // 이메일 (선택적 변경 가능)
    gender: string; // 성별 (예: "MALE", "FEMALE")
    birth: string; // 생년월일 (문자열 입력 후 서비스에서 Date 변환)
    address?: string; // 주소 (선택)
    detailAddress?: string; // 상세 주소 (선택)
    phoneNumber: string; // 전화번호
    preferences: number[]; // 선호하는 음식 카테고리 ID 배열 (예: [1, 4])
}

/** 추가 정보 등록 완료 후 응답 규격 (Response) */
export interface SocialAdditionalInfoResponse {
    userId: number;
    name: string;
    nickname: string | null;
    email: string;
    preferences: string[]; // 등록된 선호 카테고리 이름 배열
    message: string;
}
