package com.webrtc.backend.socket;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SocketModule {

    private final SocketIOServer server;
    private final SocketService service;
    // private static으로 세션 저장하기?

    public SocketModule(SocketIOServer server, SocketService service) {
        this.server = server;
        this.service = service;
        server.addConnectListener(onConnected());
        server.addDisconnectListener(onDisconnected());
        server.addEventListener("offer", Object.class, service.sendOfferToClient());
        server.addEventListener("answer", Object.class, service.sendAnswerToClient());
        server.addEventListener("ice", Object.class, service.sendIceToClient());

    }


    private ConnectListener onConnected() {

        return (client) -> {
            log.info("Socket ID[{} Transport Method{}]  Connected to socket", client.getSessionId().toString(), client.getTransport().name());
            service.joinRoom("22", server, client);
        };
    }

    private DisconnectListener onDisconnected() {
        return (client) -> {
            client.leaveRoom("22");
            log.info("Client[{}] - Disconnected from socket", client.getSessionId().toString());
        };
    }


}
