const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// DB 연결 설정
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "7968", // 본인의 실제 비밀번호로 수정하세요
  database: "umc10th", // DB 이름 확인하세요
});

// [실험 1] SQL 인젝션에 취약한 API (t_user 사용)
app.post("/api/v1/vuln/login", (req, res) => {
  const { id, pw } = req.body;

  // ❌ 위험: 문자열 결합 방식
  const sql = `SELECT * FROM t_user WHERE userId = '${id}' AND password = '${pw}'`;

  console.log("실행된 쿼리 (Vulnerable):", sql);

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send("서버 에러: " + err.message);

    if (results.length > 0) {
      res.send(`로그인 성공: ${results[0].name}님 환영합니다.`);
    } else {
      res.status(401).send("로그인 실패");
    }
  });
});

// [실험 2] Prepared Statement로 방어된 API (t_user 사용)
app.post("/api/v2/secure/login", (req, res) => {
  const { id, pw } = req.body;

  // ✅ 안전: 파라미터 바인딩 방식
  const sql = "SELECT * FROM t_user WHERE userId = ? AND password = ?";

  db.execute(sql, [id, pw], (err, results) => {
    if (err) return res.status(500).send("서버 에러: " + err.message);

    if (results.length > 0) {
      res.send(`로그인 성공: ${results[0].name}님 환영합니다.`);
    } else {
      res.status(401).send("로그인 실패");
    }
  });
});

app.listen(3000, () =>
  console.log("보안 실습 서버가 3000번 포트에서 실행 중입니다."),
);
