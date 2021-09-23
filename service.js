const express = require('express')
const app = express()
const path = require('path')
var userNum = 0; //统计在线人数
var chatList = [];//记录聊天记录
var WebSocketServer = require('ws').Server;
wss = new WebSocketServer({ port: 9000 }); //9000 与前端相对应

//调用 broadcast 广播，实现数据互通和实时更新
wss.broadcast = function (msg) {
    wss.clients.forEach(function each(client) {
        client.send(msg);
    });
};
wss.on('connection', function (ws) {
    userNum++;//建立连接成功在线人数 +1
    console.log('游客'+userNum+'进入')
    wss.broadcast(JSON.stringify({userNum:userNum})); //建立连接成功广播一次当前在线人数

    //接收前端发送过来的数据
    ws.on('message', function (e) {
        var resData = JSON.parse(e)
        console.log(resData)
        chatList.push({name:resData.name,content:resData.content._value});//每次发送信息，都会把信息存起来
        wss.broadcast(JSON.stringify({...resData})); //每次发送都相当于广播一次消息
    });
    //ws链接关闭
    ws.on('close', function (e) {
        userNum--;//建立连接关闭在线人数 -1
        wss.broadcast(JSON.stringify({ funName: 'userCount', users: userNum, chat: chatList }));//建立连接关闭广播一次当前在线人数
        console.log('Connected clients:', userNum);
        console.log('长连接已关闭')
    })
})

app.use(express.static(path.join(__dirname, 'public')));

app.listen(3001,(res)=>{
    console.log('服务器创建成功')
})