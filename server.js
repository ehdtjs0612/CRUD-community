const express = require("express");
const app = express();

// db connect
const db = require("./database/connect/mariadb");
const { error } = require('console');
db.connect();

app.use(express.json());

// 로그인 api
// loginId, pw
// POST
app.post("/login", (req, res) => {
  const { loginId, pw } = req.body;
  const result = makeResult();
  
  const sql = "SELECT id FROM user_TB WHERE login_id = ? AND password = ?";
  const param = [loginId, pw];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results[0];
    result.success = !!data;
    result.message = data ? `로그인 성공, user: ${data.id}` : `아이디 혹은 비밀번호가 존재하지 않습니다`;

    res.send(result);
  });
});

// 회원가입 api
// loginId, pw, name, phoneNumber, email
// POST
app.post("/account", (req, res) => {
  const { loginId, pw, name, phoneNumber, email } = req.body;
  const result = makeResult();

  const sql = "INSERT INTO user_TB (login_id, password, name, phone_number, email) VALUES (?, ?, ?, ?, ?)";
  const param = [loginId, pw, name, phoneNumber, email];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const isRegistered = results.affectedRows === 0;
    if (!isRegistered) {
      result.success = true;
      result.message = "회원가입 성공";
    }

    res.send(result);
  });
});

// 아이디 찾기 api
// name, phoneNumber, email
// GET
app.get("/account/loginId", (req, res) => {
  const { name, phoneNumber, email } = req.query;
  const result = makeResult();

  const sql = "SELECT login_id FROM user_TB WHERE name = ? AND phone_number = ? AND email = ?";
  const param = [name, phoneNumber, email];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results[0];
    if (data) {
      result.success = true;
      result.message = data.login_id;

    } else {
      result.message = "해당하는 아이디가 없습니다";
    }

    res.send(result);
  });
});

// 비밀번호 찾기 api
// 1.(사용자 인증 단계)
// loginId, name, phoneNumber, email
app.get("/account/pw", (req, res) => {
  const { loginId, name, phoneNumber, email } = req.query;
  const result = makeResult();

  const sql = "SELECT id FROM user_TB WHERE login_id = ? AND name = ? AND phone_number = ? AND email = ?";
  const param = [loginId, name, phoneNumber, email];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }
    
    const data = results[0];
    if (data) {
      result.success = true;
      result.message = data.id;

    } else {
      result.message = "해당하는 유저가 없습니다";
    }

    res.send(result);
  });
});

// 비밀번호 찾기 api
// 2.(비밀번호 재설정 단계)
// userId, newPw
app.post("/account/pw", (req, res) => {
  const { userId, newPw } = req.body;
  const result = makeResult();

  const sql = "UPDATE user_TB SET password = ? WHERE id = ?";
  const param = [newPw, userId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const isModified = results.affectedRows === 0;
    if (!isModified) {
      result.success = true;
      result.message = "재설정 성공";

    } else {
      result.message = "재설정 실패, 해당하는 사용자를 찾지 못했습니다";
    }

    res.send(result);
  });
});

// 프로필 보기 api
// userId
// GET
app.get("/account/:userId", (req, res) => {
  const { userId } = req.params;
  const result = makeResult();

  const sql = "SELECT login_id, name, phone_number, email, created_date, updated_date from user_TB WHERE id = ?";
  const param = [userId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results[0];
    if (data) {
      result.success = true;
      result.message = data;

    } else {
      result.message = "조회에 실패하였습니다. (존재하지 않는 유저)";
    }

    res.send(result);
  });
});

// 회원 정보 수정 api
// userId, name, phoneNumber, email
// PUT
app.put("/account", (req, res) => {
  const { userId, name, phoneNumber, email } = req.body;
  const result = makeResult();

  const sql = "UPDATE user_TB SET name = ?, phone_number = ?, email = ? WHERE id = ?";
  const param = [name, phoneNumber, email, userId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results.affectedRows === 0;
    if (!data) {
      result.success = true;
      result.message = "수정에 성공하였습니다";

    } else {
      result.message = "수정에 실패하였습니다";
    }

    res.send(result);
  });
});

// 회원 탈퇴 api
// userId
// DELETE
app.delete("/account", (req, res) => {
  const { userId } = req.body;
  const result = makeResult();

  const sql = "DELETE FROM user_TB WHERE id = ?";
  const param = [userId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results.affectedRows === 0;
    if (!data) {
      result.success = true;
      result.message = "탈퇴되었습니다";

    } else {
      result.message = "탈퇴에 실패하였습니다";
    }

    res.send(result);
  })
});

// 게시글 작성 api
// userId, title, content
app.post("/post", (req, res) => {
  const { userId, title, content } = req.body; 
  const result = makeResult();

  const sql = "INSERT INTO post_TB (user_id, title, content) VALUES (?, ?, ?)";
  const param = [userId, title, content];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results.affectedRows === 0;
    if (!data) {
      result.success = true;
      result.message = "작성에 성공하였습니다";
    }

    res.send(result);
  });
});

// 모든 게시글 조회 api
// GET
app.get("/posts", (req, res) => {
  const result = makeResult();
  const sql = "SELECT * FROM post_TB";
  const { query } = makeQuery(sql);

  db.query(query, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    result.success = true;
    result.message = results;
    res.send(result);
  });
});

// 특정 게시글 조회 api
// postId
// GET
app.get("/post/:postId", (req, res) => {
  const { postId } = req.params;
  const result = makeResult();

  const sql = "SELECT * FROM post_TB WHERE id = ?";
  const param = [postId];
  const { query, params } = makeQuery(sql,param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    // 게시글을 찾으면 true, 찾지 못하면 false
    const isFindPost = results.length === 0;
    if (!isFindPost) {
      result.success = true;
      result.message = results;

    } else {
      result.message = "해당하는 게시글이 존재하지 않습니다";
    }
    
    res.send(result);
  });
});

// 게시글 제목 수정 api
// userId, postId, title
// PATCH
app.patch("/post/:postId/title", (req, res) => {
  const { postId } = req.params;
  const { userId, title } = req.body;
  const result = makeResult();

  const sql = "UPDATE post_TB SET title = ? WHERE user_id = ? AND id = ?";
  const param = [title, userId, postId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results.affectedRows === 0;
    if (!data) {
      result.success = true;
      result.message = "수정 성공";

    } else {
      result.message = "수정 실패, 본인만 수정 가능";
    }

    res.send(result);
  });
});

// 게시글 본문 수정 api
// userId, postId, content
// PATCH
app.patch("/post/:postId/content", (req, res) => {
  const { postId } = req.params;
  const { userId, content } = req.body;
  const result = makeResult();

  const sql = "UPDATE post_TB SET title = ? WHERE user_id = ? AND id = ?";
  const param = [content, userId, postId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results.affectedRows === 0;
    if (!data) {
      result.success = true;
      result.message = "수정 성공";

    } else {
      result.message = "수정 실패, 본인만 수정 가능";
    }

    res.send(result);
  });
});

// 게시글 수정 api
// userId, postId, title, content
// PUT
app.put("/post/:postId", (req, res) => {
  const { postId } = req.params;
  const { userId, title, content } = req.body;
  const result = makeResult();

  const sql = "UPDATE post_TB SET title = ?, content = ? WHERE user_id = ? AND id = ?";
  const param = [title, content, userId, postId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results.affectedRows === 0;
    if (!data) {
      result.success = true;
      result.message = "수정 성공";

    } else {
      result.message = "수정 실패, 본인만 수정 가능";
    }

    res.send(result);
  });
});

// 게시글 삭제 api
// userId, postId
// DELETE
app.delete("/post/:postId", (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  const result = makeResult();

  const sql = "UPDATE post_TB SET title = ?, content = ? WHERE user_id = ? AND id = ?";
  const param = [postId, userId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const isDeleted = results.affectedRows === 0;
    if (!isDeleted) {
      result.success = true;
      result.message = "삭제 성공";
    } else {
      result.message = "삭제 실패, 본인만 삭제 가능";
    }

    res.send(result);
  });
});
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 댓글 생성 api
// :postId, userId, content
// POST
app.post("/post/:postId/comment", (req, res) => {
  const { postId } = req.params;
  const { userId, content } = req.body;

  const sql = "INSERT INTO comment_TB (post_id, user_id, content) VALUES (?, ?, ?)";
  const param = [postId, userId, content];
  const { query, params } = makeQuery(sql, param);

  const result = makeResult();

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results.affectedRows === 0;
    if (!data) {
      result.success = true;
      result.message = "댓글 작성 성공";
    }

    res.send(result);
  });
});

// 댓글 조회 api
// :postId
// GET
app.get("/post/:postId/comments", (req, res) => {
  const { postId } = req.params;

  const sql = "SELECT * FROM comment_TB WHERE post_id = ?";
  const param = [postId];
  const { query, params } = makeQuery(sql, param);

  const result = makeResult();

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results;
    if (data) {
      result.success = true;
      result.message = data;

    } else {
      result.message = "해당하는 게시글이 존재하지 않습니다";
    }

    res.send(result);
  });
});

// 댓글 수정 api
// :postId, :commentId, userId, content
// PUT
app.put("/post/:postId/comment/:commentId", (req, res) => {
  const { postId, commentId } = req.params;
  const { userId, content } = req.body;

  const sql = "UPDATE comment_TB SET content = ? WHERE post_id = ? AND user_id = ? AND id = ?";
  const param = [content, postId, userId, commentId];
  const { query, params } = makeQuery(sql, param);

  const result = makeResult();

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results.affectedRows === 0;
    if (!data) {
      result.success = true;
      result.message = "댓글 수정 성공";

    } else {
      result.success = false;
      result.message = "댓글 수정 실패 (본인 댓글이 아니거나 존재하지 않는 게시글임)";
    }

    res.send(result);
  });
});

// 댓글 삭제 api
// :postId, :commentId, userId
// DELETE
app.delete("/post/:postId/comment/:commentId", (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body;

  const sql = "DELETE FROM comment_TB WHERE post_id = ? AND user_id = ? AND id = ?";
  const param = [postId, userId, commentId];
  const { query, params } = makeQuery(sql, param);

  const result = makeResult();

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    const data = results.affectedRows === 0;
    if (!data) {
      result.success = true;
      result.message = "댓글 삭제 성공";

    } else {
      result.success = false;
      result.message = "댓글 삭제 실패 (존재하지 않는 게시글, 댓글이거나 본인 댓글이 아님)";
    }

    res.send(result);
  });
});

// 특정 사용자가 작성한 게시글 조회 api (로그인 아이디 기반으로)
// userLoginId
// GET
app.get("/:userLoginId/posts", (req, res) => {
  const { userLoginId } = req.params;
  const result = makeResult();

  const sql = "SELECT * FROM post_TB WHERE user_id IN (SELECT id FROM user_TB WHERE login_id = ?)";
  const param = [userLoginId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    // 게시글을 찾으면 true, 찾지 못하면 false
    const isFindPost = results.length === 0;
    if (!isFindPost) {
      result.success = true;
      result.message = results;

    } else {
      result.message = "해당하는 사용자의 게시글이 존재하지 않습니다";
    }
    
    res.send(result);
  });
});

// 특정 사용자가 작성한 댓글 조회 api (로그인 아이디 기반으로)
// userLoginId
// GET
app.get("/:userLoginId/comments", (req, res) => {
  const { userLoginId } = req.params;
  const result = makeResult();

  const sql = "SELECT * FROM comment_TB WHERE user_id IN (SELECT id FROM user_TB WHERE login_id = ?)";
  const param = [userLoginId];
  const { query, params } = makeQuery(sql, param);

  db.query(query, params, (error, results, fields) => {
    if (error) {
      console.error(error.message);
      result.message = error.sqlMessage;
      res.send(result);
      return;
    }

    // 게시글을 찾으면 true, 찾지 못하면 false
    const isFindPost = results.length === 0;
    if (!isFindPost) {
      result.success = true;
      result.message = results;

    } else {
      result.message = "해당하는 사용자의 게시글이 존재하지 않습니다";
    }
    
    res.send(result);
  });
});

app.listen(8000, () => {
  console.log("8000번 포트에서 기다리는중");
});

function makeResult() {
  return {
    success: false,
    message: "",
  };
}

function makeQuery(sql, params) {
  return {
    query: sql,
    params: params,
  };
}