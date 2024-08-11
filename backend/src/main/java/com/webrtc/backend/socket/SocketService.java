package com.webrtc.backend.socket;

import com.corundumstudio.socketio.BroadcastOperations;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.DataListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SocketService {

    private static final int MAX_CLIENTS = 2;

    public void joinRoom(String roomId, SocketIOServer server, SocketIOClient client) {
        BroadcastOperations broadcastOps = server.getRoomOperations(roomId);
        int roomSize = getRoomSize(broadcastOps);
        if (roomSize < MAX_CLIENTS) {
            client.joinRoom(roomId);
            log.info("client가 입장했습니다!");
            broadcastOps.sendEvent("welcome", client);
        }
    }

    private int getRoomSize(BroadcastOperations broadcastOps) {
        return broadcastOps.getClients().size();
    }

    // =================================== 클라이언트 방 참가 메서드

    public DataListener<Object> sendOfferToClient() {

        return (client, data, ackSender) -> {
//            log.info(client.getNamespace().getAllClients().toString());
            try {
                getBroadCastOperations(client).sendEvent("offer", client, data);
                log.info("{}가 offer를 보냈습니다!", client.getSessionId().toString());
            } catch(Exception e) {
                log.error("offer에서 에러가 발생했습니다.:", e);
            }
            // 같은 네임 스페이스에 속해 있는 클라이언트 중 나를 제외한 사람들에게 offer를 보낸다.

//            for ( SocketIOClient cl : getBroadCastOperations(client).getClients()) {
//                if (!cl.getSessionId().equals(client.getSessionId())) {
//                    cl.sendEvent("offer", data);
//                }
//            }

        };
    }

    public DataListener<Object> sendAnswerToClient() {

        return (client, data, ackSender) -> {
            log.info("{}가 answer를 보냅니다!", client.getSessionId().toString());
            getBroadCastOperations(client).sendEvent("answer", client, data);
        };

    }

    public DataListener<Object> sendIceToClient() {

        return (client, data, ackSender) -> {
    //            log.info("Ice를 보냅니다!");
            getBroadCastOperations(client).sendEvent("ice", client, data);
        };

    }

    private BroadcastOperations getBroadCastOperations(SocketIOClient client) {
      return client.getNamespace().getBroadcastOperations();
    };

}
