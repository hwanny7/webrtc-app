import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동

  const goToVideo = () => {
    navigate('/video'); // /about 페이지로 이동
  };

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={goToVideo}>비디오 방 입장하기</button>
    </div>
  );
}

export default Home;