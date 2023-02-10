<template>
  <div>
    <el-container style="height: 750px;">
      <el-aside width="200px" >
          <h1 style="margin-left: 20px">{{user.name}}的网盘</h1>
          <el-menu style="border-left: 40px" :default-active="activeIndex">
                <el-menu-item index="1" @click="home()"><el-icon><Menu /></el-icon>所有文件</el-menu-item>
                <el-menu-item index="2"><el-icon><Picture /></el-icon>图片</el-menu-item>
                <el-menu-item index="3"><el-icon><VideoCamera /></el-icon>视频</el-menu-item>
                <el-menu-item index="4"><el-icon><Document /></el-icon>文档</el-menu-item>
                <el-menu-item index="5"><el-icon><More /></el-icon>其他</el-menu-item>
          </el-menu>
      </el-aside>
      <el-container style="background-color: white">
        <el-header height="50px">
          <div style="display: inline-flex; margin-left: 10px">
            <el-button @click="back()"><el-icon><ArrowLeftBold /></el-icon></el-button>
          </div>
          <div style="display: inline-flex; margin-left: 30px">
            <h3>当前路径为:&nbsp;{{user.path}}</h3>
          </div>
          <div style="display: inline-block;margin-left: 40px">
            <el-upload
                class="upload-demo"
                action="https://jsonplaceholder.typicode.com/posts/"
                :show-file-list="false"
                :http-request="upload"
            >
              <el-button type="primary" style="margin-top: 20px"><el-icon><Plus /></el-icon>&nbsp;上传文件</el-button>
            </el-upload>
          </div>
          <div  style="display: inline-flex;margin-left: 40px">
            <el-button type="primary" style="margin-top: 20px" @click="newFolder()"><el-icon><Folder /></el-icon>&nbsp;&nbsp;新建文件夹</el-button>
          </div>
          <div style="display: inline-flex;margin-left: 40px">
            <el-input
              placeholder="请输入搜索内容"
              style="width: 300px;margin-top: 20px"
              v-model="search"
            >
              <template #append>
                <el-button type="primary" @click="searchFile()"><el-icon><Search /></el-icon></el-button>
              </template>
            </el-input>
          </div>
        </el-header>
        <el-main>
          <el-scrollbar>
            <el-table :data="tableData" >
              <el-table-column prop="fileName" label="文件名" width="120">
                <template #default="scope">
                  <el-link v-if="scope.row.type === '文件夹'" type="primary" @click="openFolder(scope.row.fileName)">{{scope.row.fileName}}</el-link>
                </template>
              </el-table-column>
              <el-table-column prop="size" label="文件大小">
                <template #default="scope">
                  <span v-if="scope.row.type === '文件夹'">-</span>
                  <span v-else>{{scope.row.size}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="uploadTime" label="上传时间" />
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="primary" v-if="scope.row.type !== '文件夹'" @click="download(scope.row)">下载</el-button>
                  <el-button type="primary" @click="deleteFile(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </div>

</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import axios from "axios";
import { onMounted } from "vue";
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const user = ref({
  name:route.query.username,
  path:'/'
})

const search = ref('')

const tableData = ref([])

const activeIndex = ref('1')


function upload(param) {
  const formData = new FormData()
  formData.append('file', param.file)
  formData.append('path', '/'+user.value.name+user.value.path)
  console.log(formData)

  axios({
    method: 'post',
    url: 'http://localhost:8080/uploadFile',
    data: formData,
  }).then(res => {
    console.log(res)
    window.location.reload()
  })
}

function download(file) {
  console.log(file)
  axios({
    method: 'get',
    url: 'http://localhost:8080/downloadFile',
    params: {
      fileName: file.fileName,
      path: '/'+user.value.name+user.value.path
    },
    responseType: 'blob'
  }).then(res => {
    console.log(res)
    const blob = new Blob([res.data], {type: 'application/octet-stream'})
    const elink = document.createElement('a')
    elink.download = file.fileName
    elink.style.display = 'none'
    elink.href = URL.createObjectURL(blob)
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href) // 释放URL 对象
    document.body.removeChild(elink)
  } )
}

function deleteFile(file){
  console.log(file)
  ElMessageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    axios({
      method: 'get',
      url: 'http://localhost:8080/deleteFile',
      params: {
        fileName: file.fileName,
        path: '/'+user.value.name+user.value.path
      }
    }).then(res => {
      console.log(res)
      window.location.reload()
    })
  }).catch(() => {
    ElMessageBox.msg('已取消删除')
  })

}

async function newFolder() {
  const {value: folderName} = await ElMessageBox.prompt('请输入文件夹名', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S/,
    inputErrorMessage: '文件夹名不能为空'
  })
  axios({
    method: 'get',
    url: 'http://localhost:8080/newFolder',
    params: {
      folderName: folderName,
      path: '/' + user.value.name + user.value.path
    },
  }).then(res => {
    console.log(res)
    window.location.reload()
  })
}

function openFolder(folderName) {
  user.value.path = user.value.path + folderName + '/'
  console.log(user.value.path)
  axios({
    method: 'get',
    url: 'http://localhost:8080/listFile',
    params: {
      path: '/' + user.value.name + user.value.path
    },
  }).then(res => {
    console.log(res)
    tableData.value = res.data
    sort()
  })
}

function home() {
  user.value.path = '/'
  axios({
    method: 'get',
    url: 'http://localhost:8080/listFile',
    params: {
      path: '/' + user.value.name + user.value.path
    },
  }).then(res => {
    console.log(res)
    tableData.value = res.data
    sort()
  })
}

function back() {
  if (user.value.path === '/') {
    return
  }
  const path = user.value.path.split('/')
  user.value.path = ''
  for (let i = 0; i < path.length - 2; i++) {
    user.value.path = user.value.path + path[i] + '/'
  }
  axios({
    method: 'get',
    url: 'http://localhost:8080/listFile',
    params: {
      path: '/' + user.value.name + user.value.path
    },
  }).then(res => {
    console.log(res)
    tableData.value = res.data
    sort()
  })
}

function sort() {
  tableData.value.sort((a, b) => {
    if (a.type === '文件夹' && b.type === '文件') {
      return -1
    } else if (a.type === '文件' && b.type === '文件夹') {
      return 1
    } else {
      return 0
    }
  })
}

function searchFile() {
  axios({
    method: 'get',
    url: 'http://localhost:8080/searchFile',
    params: {
      path: '/' + user.value.name,
      fileName: search.value
    },
  }).then(res => {
    console.log(res)
    tableData.value = res.data
    sort()
  })
}

onMounted(() => {
  axios({
    method: 'get',
    url: 'http://localhost:8080/listFile',
    params: {
      path: '/'+user.value.name+user.value.path
    }
  }).then(res => {
    console.log(res)
    tableData.value = res.data
    sort()
    })
  })
</script>

<style>

</style>