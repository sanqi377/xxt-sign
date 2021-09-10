<template>
    <div>
        <ul>
            <li v-for="item in list" :key="item.classId">
                {{ item.title }} - {{ item.teacherName }}
                <van-button
                    type="primary"
                    @click="
                        show = true;
                        form.classId = item.classId;
                        form.courseId = item.courseId;
                        form.className = item.title;
                    "
                    >添加任务</van-button
                >
            </li>
        </ul>
        <van-popup v-model="show">
            <div class="title">添加任务</div>
            <div>
                <div>事件类型</div>
                <van-checkbox v-model="form.checked">签到</van-checkbox>
            </div>
            <div>
                <div>监控频率</div>
                <van-stepper disabled v-model="form.frequency" />
            </div>
            <van-button type="primary" @click="create(form)">创建</van-button>
        </van-popup>
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
            show: false,
            form: {
                checked: true,
                frequency: 60,
                user: localStorage.getItem("user"),
            },
        };
    },
    mounted() {
        this.$api.class
            .list({ user: localStorage.getItem("user") })
            .then((res) => {
                this.list = res.data.data.list;
            });
    },
    methods: {
        create(form) {
            this.show = !this.show;
            this.$api.task.add(form).then((res) => {
                console.log(res);
            });
        },
    },
};
</script>

<style scoped>
ul > li {
    margin: 20px 15px;
}
</style>