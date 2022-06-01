const koa = require('koa')
const schedule = require('node-schedule')
const mail = require('nodemailer')
const _request= require('request')
// const axios = require('axios')
const app = new koa()
let num = 0
const sessionid = '4405867d2840c7a2228fbee2d52f7086'; // SessionID
const url = 'https://api.juejin.cn/growth_api/v1/check_in?aid=2608&uuid=7091537654956885511&_signature=_02B4Z6wo02901G5SeagAAIDBFpySrGJPZPxuRn0AAHkJbSHP038FJedFXL1m2Pou.-65IeQlelu1PLmAUHMKvaxclCa.KiE3g09.77Fmem9OsNm4ODXc4iJxR300nhcVPtYTcnC2FSpikveE0f'; // Url
const choujianUrl = 'https://api.juejin.cn/growth_api/v1/lottery/draw?aid=2608&uuid=7091537654956885511&_signature=_02B4Z6wo02901G5SeagAAIDBFpySrGJPZPxuRn0AAHkJbSHP038FJedFXL1m2Pou.-65IeQlelu1PLmAUHMKvaxclCa.KiE3g09.77Fmem9OsNm4ODXc4iJxR300nhcVPtYTcnC2FSpikveE0f'
const options = {
    url: url,
    method:'post',
    headers: {
        'cookie': 'sessionid='+ sessionid,
    },
}

const choujiangOptions = {
    url: choujianUrl,
    method: 'post',
    headers: {
        'cookie': 'sessionid='+ sessionid,
    },
}

const transport = mail.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    auth: {
        user: '767416042@qq.com',
        pass: 'oncazqeehtjrbfea'
    }
})

function request(url, options) {
    return new Promise(function (resolve, reject) {
        _request(url, options, function (error, response, body) {
            error && reject(error);
            resolve(response, body);
        })
    })
}
async function start (ctx, next) {
    num += 1
    console.log(`第${num}次请求`);
    const res = await request(options);
    const body = JSON.parse(res.body)
    console.log('签到成功', body)
    const { err_msg, data } = body || {}
    const choujiangResult = await request(choujiangOptions)
    const choujiangResultBody = JSON.parse(choujiangResult.body)
    console.log('抽奖成功', choujiangResultBody);
    const { data: choujian_data, err_msg: choujian_msg } = choujiangResultBody
    const mailOption = {
        from: '生活就像一场梦 767416042@qq.com',
        to: 'moye@yowant.com',
        subject: '每日打卡',
        html: `<div>
            <p>打卡结果：${err_msg}</p>
            <p>获得矿石：${data && data.incr_point || '-'}</p>
            <p>共计矿石：${data && data.sum_point || '-'}</p>
            <p>抽奖状态: ${choujian_msg}</p>
            <p>抽奖结果：${choujian_data && choujian_data.lottery_name} <img width="40px" height="40px" src=${choujian_data.lottery_image} /></p>
            <p>当前幸运值： ${choujian_data && choujian_data.total_lucky_value}</p>
        </div>`,
    }
    transport.sendMail(mailOption, (err, response) => {
        if(err) { console.log('邮件错误', err) }
        else { console.log('邮件结果', response)}
    })
}

const rule = '30 10 0 * * *'; // 每天的凌晨0点10分30秒触发'
// 定时任务
const scheduleCronstyle = ()=>{
    schedule.scheduleJob('signIn', rule,() => {
        start();
    });
}

app.listen(9000,()=>{
    console.log('服务启动成功！');
    scheduleCronstyle(); // 定时启动
    // start(); // 立即启动
})
// schedule.scheduleJob('test', '30 * * * * *', () => {
//     num += 1
//     console.log('The answer to life, the universe, and everything!', num);
//     if(num === 2) {
//         schedule.cancelJob('test')
//     }
// })