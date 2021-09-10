<template>
    <div>
        <ul>
            <li v-for="item in list" :key="item.id">
                <div class="time">{{ (item.date * 1000) | toDateString }}</div>
                <div class="name">
                    {{ item.name }}
                </div>
                <div class="msg">{{ item.msg }}</div>
            </li>
        </ul>
        <van-tabbar route>
            <van-tabbar-item replace to="/index" icon="home-o"
                >首页</van-tabbar-item
            >
            <van-tabbar-item replace to="/task" icon="search"
                >任务</van-tabbar-item
            >
            <van-tabbar-item replace to="/logs" icon="friends-o"
                >日志</van-tabbar-item
            >
        </van-tabbar>
    </div>
</template>

<script>
let status = false,
    log;
export default {
    data() {
        return {
            list: [],
        };
    },
    mounted() {
        this.getLogs();
        log = setInterval(() => {
            this.getLogs();
        }, 1000);
    },
    destroyed() {
        clearTimeout(log);
    },
    methods: {
        getLogs() {
            status = false;
            if (!status) {
                this.$api.log
                    .list({ user: localStorage.getItem("user") })
                    .then((res) => {
                        status = true;
                        this.list = res.data.data.data;
                    });
            }
        },
    },
};
</script>

<style scoped>
ul {
    padding: 15px;
    background: #000;
}
ul > li {
    color: green;
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
}
ul > li > div {
    width: 30%;
}
</style>