import "./App.css";
import example from "./image.png";
import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    alert("이메일 등록이 완료되었습니다.");
    setEmail("");
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="content">
          <img src={example} alt="example" className="image" />
          <h1 className="title">충남대학교 컴퓨터공학과 공지 메일링 서비스</h1>
          <p className="text">
            매일 6시 10분에 오늘의 공지를 정리해서 전달해드립니다.
          </p>
          <form onSubmit={onSubmit}>
            <input
              placeholder="이메일을 입력해주세요."
              className="email-input"
              type="text"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <button>제출</button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;
