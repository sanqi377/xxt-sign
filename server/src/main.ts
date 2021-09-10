const express = require("express")
const request = require('request')
const superagent = require('superagent')
const cheerio = require('cheerio')
const schedule = require('node-schedule')
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/xxt", (err: any) => {
  if (err) {
    console.log('连接失败')
  } else {
    console.log("连接成功")
  }
})

const Task = mongoose.model("task", {
  user: Number,
  type: String,
  frequency: Number,
  classId: Number,
  courseId: Number,
  className: String,
  status: Number,
  cookie: String
})

const Log = mongoose.model("log", {
  user: Number,
  type: String,
  msg: String,
  date: Number,
  name: String
})


const app = express()

/**
 * 跨域处理
 */
app.all("*", function (req: any, res: any, next: any) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS")
  if (req.method.toLowerCase() == 'options')
    res.sendStatus(200)
  else
    next()
})

/**
 * 登录获取 Cookie
 */
app.get('/login', (req: any, res: res) => {
  let { username, password } = req.query
  let url: string = `https://passport2-api.chaoxing.com/v11/loginregister?uname=${username}&code=${password}`
  request(url, (err: object, resp: any, body: string) => {
    let cok: any = Object.values(resp.caseless.dict)[5]
    let cookie: string = ''
    cok.forEach((item: string) => {
      let index = item.indexOf(";")
      let str = item.substring(0, index + 1)
      cookie += str
    })
    Task.updateMany({ user: username }, { cookie }, () => {
      res.send({ ret: 200, data: { msg: '登录成功', cookie } })
    })
  })
})

/**
 * 根据 Cookie 获取所有课程列表
 */
app.get('/getClassList', (req: any, res: res) => {
  let Cookie = req.headers.token
  let { user } = req.query
  let url: string = 'http://mooc1-api.chaoxing.com/mycourse/backclazzdata'
  superagent.get(url)
    .set('Cookie', Cookie)
    .end((err: any, response: any) => {
      if (err || !response.ok) {
        res.send('error');
      } else {
        if (err) {
          console.log("Error:" + err);
        } else {
          let body = JSON.parse(response.text).channelList
          let list: any = []
          body.forEach((item: any) => {
            let obj: any = {}
            obj.courseId = item.content.course.data[0].id
            obj.classId = item.content.id
            obj.title = item.content.course.data[0].name
            obj.teacherName = item.content.course.data[0].teacherfactor
            list.push(obj)
          })
          res.send({ ret: 200, data: { msg: '课程列表获取成功', list } })
        }
      }
    })
})

/**
 * 添加任务
 */
app.get('/addTask', (req: any, res: res) => {
  let data = req.query
  let Cookie = req.headers.token
  Task.find({ classId: Number(data.classId), user: data.user }).then((result: any) => {
    if (result.length > 0) {
      res.send({ ret: 200, data: { msg: '任务已存在' } })
    } else {
      new Task({
        user: data.user,
        type: 'sign',
        frequency: Number(data.frequency),
        classId: Number(data.classId),
        courseId: Number(data.courseId),
        className: data.className,
        status: 1,
        cookie: Cookie
      }).save().then(() => {
        addSignTask({ cookie: Cookie, courseId: data.courseId, classId: data.classId, user: data.user })
        res.send({ ret: 200, data: { msg: '任务添加成功' } })
      }, () => {
        res.send({ ret: 201, data: { msg: '任务添加失败' } })
      })
    }
  })
})

/**
 * 获取任务 ID
 */
const getTaskId = (cookie: string, courseId: Number, classId: Number) => {
  let url: string = `http://mobilelearn.chaoxing.com/widget/pcpick/stu/index?courseId=${courseId}&jclassId=${classId}`
  return new Promise((resolve) => {
    superagent.get(url)
      .set('Cookie', cookie)
      .end((err: any, response: any) => {
        if (err || !response.ok) {
          resolve(err)
        } else {
          let regex = `\\((.+?)\\)`
          let $ = cheerio.load(response.text)
          let idList: any = []
          $('#startList div').find('.Mct').map((index: any, element: any) => {
            let activeId = element.attribs.onclick.match(regex)[1].split(',')
            if (activeId[1] == 2) {
              idList.push(activeId[0])
            }
          })
          resolve(idList)
        }
      })
  })
}

/**
 * 签到
 */
const sign = (cookie: string, activeId: Number) => {
  let url: string = `https://mobilelearn.chaoxing.com/pptSign/stuSignajax?activeId=${activeId}`
  return new Promise((resolve) => {
    superagent.get(url)
      .set('Cookie', cookie)
      .end((err: any, response: any) => {
        if (err || !response.ok) {
          resolve(err)
        } else {
          resolve(response.text)
        }
      })
  })
}

/**
 * 添加签到任务
 */
const addSignTask = (data: any) => {
  getTaskId(data.cookie, data.courseId, data.classId).then((res: any) => {
    res.forEach((item: any) => {
      schedule.scheduleJob('0 * * * * *', () => {
        sign(data.cookie, Number(item)).then((res: any) => {
          new Log({
            user: data.user,
            type: 'sign',
            msg: res,
            date: Date.parse(new Date() as any) / 1000
          }).save().then(() => {
            console.log('日志添加成功')
          }, () => {
            console.log('任务添加失败')
          })
        })
      })
    })
  })
}

/**
 * 执行签到任务
 */
let runTask = () => {
  schedule.scheduleJob('0 * * * * *', () => {
    Task.find().then((result: any) => {
      result.forEach((item: any) => {
        getTaskId(item.cookie, item.courseId, item.classId).then((res: any) => {
          if (res.length != 0) {
            res.forEach((items: any) => {
              sign(item.cookie, Number(items)).then((res: any) => {
                console.log(res)
                new Log({
                  user: item.user,
                  type: 'sign',
                  name: item.className,
                  msg: res,
                  date: Date.parse(new Date() as any) / 1000
                }).save().then(() => {
                  console.log('日志添加成功')
                }, () => {
                  console.log('任务添加失败')
                })
              })
            })
          } else {
            new Log({
              user: item.user,
              type: 'sign',
              name: item.className,
              msg: '暂无签到任务',
              date: Date.parse(new Date() as any) / 1000
            }).save().then(() => {
              console.log('日志添加成功')
            }, () => {
              console.log('任务添加失败')
            })
          }
        })
      })
    })
  })
}
runTask()


/**
 * 获取任务列表
 */
app.get('/getTaskList', (req: any, res: res) => {
  let { user } = req.query
  Task.find({ user: user }).then((result: any) => {
    if (result.length > 0) {
      res.send({ ret: 200, data: { data: result, msg: '请求任务成功' } })
    } else {
      res.send({ ret: 201, data: { msg: '暂无任何任务' } })
    }
  })
})

/**
 * 获取任务日志
 */
app.get('/getLogs', (req: any, res: res) => {
  let { user } = req.query
  Log.find({ user: user }).sort([['_id', -1]]).limit(100).then((result: any) => {
    if (result.length > 0) {
      res.send({ ret: 200, data: { data: result, msg: '请求日志成功' } })
    } else {
      res.send({ ret: 201, data: { msg: '暂无任何任务' } })
    }
  })
})

app.listen(3000, () => {
  console.log("server start! OK!")
})