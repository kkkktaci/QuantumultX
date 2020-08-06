let config = {
    apiKey: '',
    location: '',    // 查询地区的经纬度, 如(12.3,45.6)
    lang: 'zh'
}

let notification = {
    title: '和风',
    apiError: '获取天气信息错误',
    dataError: '天气数据错误'
}

let baseUrl = 'https://devapi.heweather.net/v7/weather'
let queryString = `key=${config.apiKey}&location=${config.location}&lang=${config.lang}`
var weatherRequest = {
    url: `${baseUrl}/now?${queryString}`
}
var dailyRequest = {
    url: `${baseUrl}/3d?${queryString}`
}

var weather = {}
function getWeather() {
    fetchData(weatherRequest, data => {
        handleNowData(data.now)
        // 获取3天预报
        getDailyWeather()
    })
}

function getDailyWeather() {
    fetchData(dailyRequest, data => {
        handleDailyData(data.daily)
        // 发送通知消息
        fireNotify()
    })
}

function fetchData(request, callback) {
    $task.fetch(request).then(response => {
        try {
            var data = JSON.parse(response.body)
            if (data.code === "200") {
                callback(data)
            } else {
                $notify(notification.title, notification.dataError, data.code)
            }
        } catch (e) {
            $notify(notification.title, notification.dataError, JSON.stringify(e))
        }
    }, reason => {
        $notify(notification.title, notification.apiError, reason.error)
    })
}

function handleNowData(weatherNow) {
    const {
        text,       // 当前天气状况的文字描述
        temp,       // 当前气温
        feelsLike,  // 体感温度
        humidity,   // 体感温度
        precip,     // 降水量
        vis         // 能见度
    } = weatherNow
    weather.text = text
    weather.temp = temp
    weather.feelsLike = feelsLike
    weather.humidity = humidity
    weather.precip = precip
    weather.vis = vis
}

function handleDailyData(weatherDaily) {
    var today = weatherDaily[0]
    const {
        tempMax,    // 最高温
        tempMin     // 最低温
    } = today
    weather.tempMax = tempMax
    weather.tempMin = tempMin
}

function fireNotify() {
    var subTitle = `🌞上海 今日天气: ${weather.text}, ${weather.tempMin} ~ ${weather.tempMax}℃`
    var detail = `🌡当前气温: ${weather.temp}℃, 体感温度: ${weather.feelsLike}℃\n湿度: ${weather.humidity}%\n当前降水量: ${weather.precip}毫米\n能见度: ${weather.vis}公里`
    $notify(notification.title, subTitle, detail)
}

getWeather();