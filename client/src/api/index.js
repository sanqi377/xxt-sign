import ajax from 'axios'

ajax.defaults.baseURL = "http://127.0.0.1:3000"

const paramToString = (param) => {
  var str = "?"
  var key = Object.keys(param)
  var val = Object.values(param)
  for (let i = 0; i < Object.keys(param).length; i++) {
    str += key[i] + "=" + val[i] + "&"
  }
  return str
}

const api = {
  user: {
    login: (param) => {
      const data = paramToString(param)
      return ajax.get("/login" + data);
    }
  },
  class: {
    list: (param) => {
      const data = paramToString(param)
      return ajax.get("/getClassList" + data);
    }
  },
  task: {
    add: (param) => {
      const data = paramToString(param)
      return ajax.get("/addTask" + data);
    },
    list: (param) => {
      const data = paramToString(param)
      return ajax.get("/getTaskList" + data);
    }
  },
  log: {
    list: (param) => {
      const data = paramToString(param)
      return ajax.get("/getLogs" + data);
    }
  }
}

export default api;