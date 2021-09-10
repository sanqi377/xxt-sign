<template>
    <div>
        <h2>登录</h2>
        <van-form @submit="onSubmit">
            <van-field
                v-model="username"
                name="username"
                label="账号"
                placeholder="请输入学习通账号"
                :rules="[{ required: true, message: '请输入学习通账号' }]"
            />
            <van-field
                v-model="password"
                type="password"
                name="password"
                label="密码"
                placeholder="请输入学习通密码"
                :rules="[{ required: true, message: '请输入学习通密码' }]"
            />
            <div style="margin: 16px">
                <van-button round block type="info" native-type="submit"
                    >提交</van-button
                >
            </div>
        </van-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: "",
            password: "",
            isLogin: localStorage.getItem("cookie") ? true : false,
        };
    },
    mounted() {
        if (this.isLogin) this.$router.push("/index");
    },
    methods: {
        onSubmit(val) {
            this.$toast.loading({
                message: "登录中...",
                forbidClick: true,
            });
            let _this = this;
            this.$api.user
                .login({
                    username: val.username,
                    password: val.password,
                })
                .then((res) => {
                    this.$toast.success({
                        message: res.data.data.msg,
                        forbidClick: true,
                        onClose: function () {
                            _this.$router.push("/index");
                        },
                    });
                    localStorage.setItem("user", val.username);
                    localStorage.setItem("cookie", res.data.data.cookie);
                    this.isLogin = true;
                });
        },
    },
};
</script>

<style>
</style>