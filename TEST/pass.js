const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); // 4주차 추가: 암호화 라이브러리

const app = express();
app.use(bodyParser.json());

// DB 연결 설정
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "7968",
    database: "security_test",
});

/**
 * [실습 1] Bcrypt 암호화 기반 회원가입 API
 * 목적: 평문 패스워드를 단방향 해시(Salt + Stretching) 처리하여 DB에 저장합니다.
 */
app.post("/api/v4/register", async (req, res) => {
    const { id, pw, name, email } = req.body;

    try {
        // 10회 해시 꼬기 (Salt 자동 생성 및 Key Stretching 적용)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pw, saltRounds);

        console.log(
            `[회원가입] 평문 암호: ${pw} -> 암호화된 결과: ${hashedPassword}`,
        );

        // DB에 안전하게 암호화된 비밀번호 저장
        const sql =
            "INSERT INTO t_user (userId, password, name, email) VALUES (?, ?, ?, ?)";

        db.execute(sql, [id, hashedPassword, name, email], (err, results) => {
            if (err) return res.status(500).send("서버 에러: " + err.message);
            res.status(201).send("회원가입 성공! DB를 확인해 보세요.");
        });
    } catch (error) {
        res.status(500).send("암호화 실패: " + error.message);
    }
});

/**
 * [실습 2] 안전한 마이페이지 조회 API (DTO 분리 및 마스킹)
 * 목적: DB 객체(Entity)를 그대로 던지지 않고, 가공된 DTO를 통해 민감 정보를 은닉합니다.
 */
app.get("/api/v4/user/:id", (req, res) => {
    const targetId = req.params.id;

    const sql = "SELECT * FROM t_user WHERE userId = ?";

    db.execute(sql, [targetId], (err, results) => {
        if (err) return res.status(500).send("서버 에러: " + err.message);
        if (results.length === 0)
            return res.status(404).send("유저를 찾을 수 없습니다.");

        const userEntity = results[0]; // DB에서 갓 꺼낸 데이터 (Entity)

        // ❌ 취약한 방식: res.json(userEntity);
        // -> 프론트에 암호화된 패스워드 주소까지 고스란히 유출됨 (F12 네트워크 탭에 다 보임)

        // ✅ 안전한 방식: 백엔드 단에서 데이터 가공 (DTO화 및 마스킹)
        let maskedEmail = "이메일 없음";
        if (userEntity.email) {
            const emailParts = userEntity.email.split("@");
            // 앞 3글자만 남기고 나머지는 *** 처리
            maskedEmail =
                emailParts[0].substring(0, 3) + "***@" + emailParts[1];
        }

        // 화면에 꼭 필요한 정보만 추려낸 전송용 객체(DTO) 생성
        const userProfileDTO = {
            userId: userEntity.userId,
            name: userEntity.name,
            email: maskedEmail,
            // 🛡️ password 칼럼은 의도적으로 완전히 제외!
        };

        console.log(
            "[조회 요청] 응답으로 전송되는 DTO 데이터:",
            userProfileDTO,
        );
        res.json(userProfileDTO);
    });
});

app.listen(3000, () =>
    console.log("4주차 보안 실습 서버가 3000번 포트에서 실행 중입니다."),
);
