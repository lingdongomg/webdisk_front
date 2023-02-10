<template>
  <div class="app">
    <div id="login-form" class="login-form">
      <div style="margin-left: 10%">
        <h1>Hadoop网盘</h1>
      </div>
      <div class="common-layout">
        <el-container>
          <el-header>
            <el-radio-group v-model="loginOrRegister" size="large" style="margin-left: 8%;">
              <el-radio-button label="已有账号-登录"/>
              <el-radio-button label="暂无账号-注册"/>
            </el-radio-group>
          </el-header>
          <el-main v-if="loginOrRegister==='已有账号-登录'">
            <el-form :model="loginForm" style="width: 80%;margin-left: 10%" :rules="rules" ref="ruleFormRef">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="请输入用户名" size="large"></el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" size="large"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="login(ruleFormRef)" style="margin-left: 35%">登录</el-button>
              </el-form-item>
            </el-form>
          </el-main>
          <el-main v-if="loginOrRegister==='暂无账号-注册'">
            <el-form :model="registerForm" style="width: 80%;margin-left: 10%" :rules="rules" ref="ruleFormRef">
              <el-form-item prop="username">
                <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large"></el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input type="password" v-model="registerForm.password" placeholder="请输入密码" size="large"></el-input>
              </el-form-item>
              <el-form-item prop="checkPass">
                <el-input type="password" v-model="registerForm.checkPassword" placeholder="请再次输入密码"
                          size="large"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="registered(ruleFormRef)" style="margin-left: 35%">注册</el-button>
              </el-form-item>
            </el-form>
          </el-main>
        </el-container>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive} from 'vue'
import {ref} from 'vue'
import axios from "axios";
import {ElMessage} from 'element-plus'
import {useRouter} from 'vue-router'

const router = useRouter()
const ruleFormRef = ref('')
const rules = reactive({
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
  ],
  checkPass: [
    {
      validator: (rule, value, callback) => {
        if (registerForm.checkPassword === '') {
          callback(new Error('请再次输入密码'));
        } else if (registerForm.checkPassword !== registerForm.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      }, trigger: 'blur'
    }
  ]
})
const loginOrRegister = ref('已有账号-登录')
const loginForm = reactive({
  username: '',
  password: ''
})
const registerForm = reactive({
  username: '',
  password: '',
  checkPassword: ''
})
const login = async (formEl) => {
  if (!formEl) {
    return
  }
  await formEl.validate((valid) => {
    if (valid) {
      axios({
        method: 'post',
        url: 'http://localhost:8080/login',
        data: JSON.stringify(loginForm),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 200) {
          ElMessage.success('登录成功')
          router.push(
              {
                path: '/home',
                query: {
                  username: loginForm.username
                }
              }
          )
        } else {
          ElMessage.error(res.data.msg)
        }
      })
    } else {
      console.log('error submit!!');
    }
  })
}

const registered = async (formEl) => {
  if (!formEl) {
    return
  }
  await formEl.validate((valid) => {
    if (valid) {
      axios({
        method: 'post',
        url: 'http://localhost:8080/register',
        data: JSON.stringify(registerForm),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 200) {
          loginOrRegister.value = '已有账号-登录'
          ElMessage({
            message: '注册成功',
            type: 'success'
          })
        } else {
          ElMessage.error(res.data.msg)
        }
      })
    } else {
      console.log('error submit!!');
    }
  })
}
</script>

<style scoped>

.app {
  min-height: 100vh;
  background-image: url(../assets/background.png);
  background-size: 100% 100%;
  overflow: hidden
}

.login-form {
  height: 380px;
  width: 348px;
  margin: 200px auto 0 65%;
  border: 2px solid var(--el-border-color);
  border-radius: 20px;
}
</style>