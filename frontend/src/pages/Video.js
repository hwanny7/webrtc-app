import React from 'react';
import { useEffect, useRef, useCallback, useState } from "react";
import io from 'socket.io-client';



const Video = () => {
  const socketRef = useRef();
  const peerRef = useRef();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const ChannelRef = useRef();
  const myStream = useRef();

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  const [cameraOptions, setCameraOptions] = useState([]);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);


  // ===================================== camera, mic settings

  // const handleMiceOff = () => {
  //   setMicOn((prev) => !prev);
  //   myStream
  //   .getAudioTracks()
  //   .forEach((track) => (track.enabled = !track.enabled));
  // }
  
  // const handleCameraOff = () => {
  //   setCameraOn((prev) => !prev);
  //   myStream
  //     .getVideoTracks()
  //     .forEach((track) => (track.enabled = !track.enabled));
  //     // muted 변수와 element요소 변경하기
  // }

  const getCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setCameraOptions(devices.filter(
      (device) => device.kind === "videoinput"
    ));
  }
  // 나중에 카메라가 여러 대일 때 옵션을 보고 선택할 수 있게 만들어야 함


  const getMedia = async (deviceId) => {
    const initialConstrains = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };

    try {
      myStream.current = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstraints : initialConstrains
      );
      localVideoRef.current.srcObject = myStream.current;
      if (!deviceId) {
        await getCameras();
      }
      // 처음에는 device 모드가 설정되어 있지 않기 때문에 facingmode user로 작동하고, 그 다음에 getCameras로 카메라 옵션을 가져오기

    } catch (e) {
      console.error("getMedia를 실행할 수 없습니다.");
      setCameraOn(false);
      setMicOn(false);
    }

  }







  // ===================================== 

  useEffect(() => {

    const initCall = async () => {
      console.log("initcall!")
      await getMedia();
      makeConnection();
      setSocket();
    }
    initCall()


    // return () => {
    //   turnOffSocket();
    // }

  }, [])


  // ===================================== Socket

  const setSocket = () => {
    socketRef.current = io("http://172.30.1.27:8085");
    // socketRef.current = io("http://172.30.1.27:8085", {transports: ['websocket']});
    // socketRef.current.emit("join_room", 123);
    // 나중에 서버 주소 넣어야함

    socketRef.current.on("welcome", async () => {
      console.log("offer 보냄!")
      console.log('Connected with transport:');
      ChannelRef.current = peerRef.current.createDataChannel("chat");
      // ChannelRef.current.onmessage = (event) => receiveMessage(event);
      // 메시지가 왔을 때 receiveMessage 함수에 인자로 넘기기

      const offer = await peerRef.current.createOffer();
      peerRef.current.setLocalDescription(offer);

      socketRef.current.emit("offer", offer)
    })

    socketRef.current.on("offer", async(offer) => {
      console.log("offer 받고 answer 보냄!")
      peerRef.current.ondatachannel = (event) => {
        ChannelRef.current = event.channel;
        // ChannelRef.current.onmessage = (event) => receiveMessage(event);
      }

      peerRef.current.setRemoteDescription(offer);
      const answer = await peerRef.current.createAnswer();
      peerRef.current.setLocalDescription(answer);
      socketRef.current.emit("answer", answer);
    })

    socketRef.current.on("answer", (answer) => {
      console.log("answer 받음!");
      peerRef.current.setRemoteDescription(answer);
    })

    socketRef.current.on("ice", (ice) => {
      console.log("ice 받음!");
      // if (peerRef.current.remoteDescription !== null) {
      //   peerRef.current.addIceCandidate(ice);
      // }
      peerRef.current.addIceCandidate(ice);
      //
    });
    console.log("socket 생성함!")

  }

  // const turnOffSocket = () {
  //   socketRef.current.off
  // }

  // ===================================== makeConnection

  const makeConnection = () => {
    console.log("makeConnection 호출됐다!");
    peerRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
            "stun:stun4.l.google.com:19302",
          ],
        },
      ],
    });

    peerRef.current.onicecandidate = (e) => {
      console.log("ice 보냄!")
      socketRef.current.emit("ice", e.candidate, 123);
    }

    peerRef.current.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    // 상대방의 미디어 스트림을 수신하고 비디오에 표시

    if (myStream.current) {
      myStream.current.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, myStream.current);
      })
    }

  }

  const handleEnter = () => {

  }

  return (
    <div>
      <h1>Video Chat</h1>
      <button onClick={handleEnter}>입장하기</button>
      <video
          ref={remoteVideoRef}
          playsInline
          autoPlay
          muted
        />
        <video
          ref={localVideoRef}
          playsInline
          autoPlay
          muted
        />
    </div>
  );
};

export default Video;