const app = require('./app');

app.listen(app.get('port'), () => { // 포트설정
    console.log(`server on! http://localhost:${app.get('port')}`)
})