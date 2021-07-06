/*
const WebSocket = require('ws')

module.exports = (server) => {
    const wss = new WebSocket.Server({ server })

    wss.on('connection', (ws, req) => { // 웹소켓 연결시
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // client의 IP를 알아내는 방법
        console.log('새로운 클라이언트 접속', ip);
        ws.on('message', (message) => { // 메세지 수신시
            console.log(message);
        })
        ws.on('error', (error) => { // error
            console.error(error);
        })
        ws.on('close', () => { // 연결 종료
            console.log('클라이언트 접속 해제', ip)
            clearInterval(ws.interval)
        })

        ws.interval = setInterval(() => { // 3초마다 client로 메세지 보냄
            if (ws.readyState === ws.OPEN){ // ws.CONNECTING(연결중) CLOSING(닫는중) CLOSED(닫힘)
                ws.send('서버에서 클라이언트로 메세지를 보냄')
            }
        }, 3000)
    })
}

// WebSocket 생성자에 연결할 서버 주소를 넣고 webSocket 객체를 생성
// 서버와 연결되는 경우 onopen 이벤트 리스너가 호출됨
// 서버로부터 메세지가 오는 경우에는 onmessage 이벤트 리스너 호출됨
*/

/*
const SocketIO = require('socket.io') // 패키지를 불러와서 express 서버와 연결

module.exports = (server) => {
    const io = SocketIO(server, { path: '/socket.io' }); // 두번째 인수는 서버에 관한 설정. 클라이언트가 접속할 경로인 path옵션만 사용함
    io.on('connection', (socket) => { // 클라이언트가 접속했을 때 발생, 콜백으로 socket 객체
        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // client의 IP를 알아내는 방법
        console.log('새로운 클라이언트 접속', ip, socket.id, req.ip);
        socket.on('disconnect', () => { // 연결 종료시
            console.log('클라이언트 접속 해제', ip, socket.id);
            clearInterval(socket.interval);
        });
        socket.on('error', (error) => { // 에러시
            console.error(error);
        })
        socket.on('reply', (data) => { // 클라이언트로부터 메시지 수신 시
            console.log(data);
        })
        socket.interval = setInterval(() => {
            socket.emit('news', 'Hello Socket.IO');
        }, 3000);
    })
}
*/

const SocketIO = require('socket.io');

module.exports = (server, app) => {
  const io = SocketIO(server, { path: '/socket.io' });
  app.set('io', io); // 라우터에서 io 객체를 쓸 수 있게 저장.
  const room = io.of('/room'); // of : Socket.IO에 네임스페이스르 ㄹ부여하는 메서드
  const chat = io.of('/chat');

  room.on('connection', (socket) => {
    console.log('room 네임스페이스에 접속');
    socket.on('disconnect', () => {
      console.log('room 네임스페이스 접속 해제');
    });
  });

  chat.on('connection', (socket) => {
    console.log('chat 네임스페이스에 접속');
    const req = socket.request;
    const { headers: { referer } } = req;
    const roomId = referer
      .split('/')[referer.split('/').length - 1]
      .replace(/\?.+/, '');
    socket.join(roomId);

    socket.on('disconnect', () => {
      console.log('chat 네임스페이스 접속 해제');
      socket.leave(roomId);
    });
  });
};