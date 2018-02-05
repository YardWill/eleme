const axios = require('axios')
const querystring = require('querystring')
const cookie = require('./cookie')

const origin = 'https://h5.ele.me'

const request = axios.create({
  baseURL: origin,
  headers: {
    origin,
    referer: `${origin}/hongbao/`,
    'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; PRO 6 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043221 Safari/537.36 V1_AND_SQ_7.0.0_676_YYB_D QQ/7.0.0.3135 NetType/WIFI WebP/0.3.0 Pixel/1080'
  }
})

module.exports = async ({
  mobile,
  url
}) => {
  console.log(url)
  let index = 0
  const query = querystring.parse(url)
  await lottery()

  async function lottery(phone) {
    const sns = cookie[index]
    phone = phone || `138${String(Math.random() * 10).slice(-8)}`
    console.log(phone)
    // 绑定手机号
    await request.put(`/restapi/v1/weixin/${sns.openid}/phone`, {
      sign: sns.eleme_key,
      phone
    })

    // 领红包
    const {
      data: {
        promotion_records = []
      }
    } = await request.post(`/restapi/marketing/promotion/weixin/${sns.openid}`, {
      device_id: '',
      group_sn: query.sn,
      hardware_id: '',
      method: 'phone',
      phone,
      platform: query.platform,
      sign: sns.eleme_key,
      track_id: '',
      unionid: 'fuck',
      weixin_avatar: '',
      weixin_username: ''
    })

    // 计算剩余第几个为最佳红包
    const number = query.lucky_number - promotion_records.length
    if (number <= 0) {
      console.log('最佳红包已被领取')
      return
    }

    console.log(`还要领 ${number} 个红包`)
    index++
    // 如果这个是最佳红包，换成指定的手机号领取
    await lottery(number === 1 ? mobile : null)
  }
}
