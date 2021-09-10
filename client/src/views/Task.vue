<template>
    <div>
        <ul>
            <li v-for="item in list" :key="item.id">
              {{item.className}}
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
export default {
    data() {
        return {
            list: [],
        };
    },
    mounted() {
        this.$api.task
            .list({ user: localStorage.getItem("user") })
            .then((res) => {
              this.list = res.data.data.data
            });
    },
};
</script>

<style>
</style>