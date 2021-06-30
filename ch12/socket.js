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