<template>
  <div class="view-account">
    <div class="view-account-header"></div>
    <div class="view-account-container">
      <div class="view-account-top">
        <div class="view-account-top-logo">
          <img :src="websiteConfig.loginImage" alt="" />
        </div>
        <div class="view-account-top-desc">{{ websiteConfig.loginDesc }}</div>
      </div>
      <div class="view-account-form">
        <n-form
          ref="formRef"
          label-placement="left"
          size="large"
          :model="formInline"
          :rules="rules"
        >
          <n-tabs
            default-value="account-sign"
            size="large"
            v-model:value="formInline.loginType"
            justify-content="space-evenly"
          >
            <n-tab-pane name="account-sign" tab="账号密码登录">
              <n-form-item path="username">
                <n-input v-model:value="formInline.username" placeholder="请输入用户名">
                  <template #prefix>
                    <n-icon size="18" color="#808695">
                      <PersonOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item path="password">
                <n-input
                  v-model:value="formInline.password"
                  type="password"
                  showPasswordOn="click"
                  placeholder="请输入密码"
                >
                  <template #prefix>
                    <n-icon size="18" color="#808695">
                      <LockClosedOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
            </n-tab-pane>
            <n-tab-pane name="phone-sign" tab="手机号登录">
              <n-form-item path="phone">
                <n-input v-model:value="formInline.phone" placeholder="请输入手机号">
                  <template #prefix>
                    <n-icon size="18" color="#808695">
                      <PersonOutline />
                    </n-icon>
                  </template>
                </n-input>
              </n-form-item>
              <n-form-item path="code">
                <n-input v-model:value="formInline.code" placeholder="验证码">
                  <template #prefix>
                    <n-icon size="18" color="#808695">
                      <MailOutline />
                    </n-icon>
                  </template>
                </n-input>
                <n-button
                  type="primary"
                  style="margin-left: 20px"
                  :disabled="countingDown"
                  @click="handleGetVerificationCode"
                >
                  {{ countingDown ? `${countdown} 秒后重新获取` : '获取验证码' }}
                </n-button>
              </n-form-item>
            </n-tab-pane>
          </n-tabs>

          <n-form-item class="default-color">
            <div class="flex view-account-other">
              <div class="flex-initial">
                <n-checkbox v-model:checked="autoLogin">自动登录</n-checkbox>
              </div>
              <div class="flex-initial">
                <a href="javascript:">忘记密码</a>
              </div>
              <div class="flex-initial" style="margin-left: auto">
                <router-link to="/register">注册账号</router-link>
              </div>
            </div>
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleSubmit" size="large" :loading="loading" block>
              登录
            </n-button>
          </n-form-item>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '@/store/modules/user';
  import { useMessage } from 'naive-ui';
  import { ResultEnum } from '@/enums/httpEnum';
  import {
    PersonOutline,
    LockClosedOutline,
    LogoGithub,
    LogoFacebook,
    MailOutline,
  } from '@vicons/ionicons5';
  import { PageEnum } from '@/enums/pageEnum';
  import { websiteConfig } from '@/config/website.config';
  interface FormState {
    username: string;
    password: string;
    loginType: string;
    phone: string;
    code: string;
  }

  const formRef = ref();
  const message = useMessage();
  const loading = ref(false);
  const autoLogin = ref(true);
  const LOGIN_NAME = PageEnum.BASE_LOGIN_NAME;

  // 倒计时相关变量
  const countdown = ref(60);
  const countingDown = ref(false);
  let timer: NodeJS.Timeout | null = null;

  const formInline = reactive({
    username: 'admin',
    password: '123456',
    loginType: 'account-sign',
    phone: '',
    code: '',
  });

  const rules = {
    username: { required: true, message: '请输入用户名', trigger: 'blur' },
    password: { required: true, message: '请输入密码', trigger: 'blur' },
  };

  const userStore = useUserStore();

  const router = useRouter();
  const route = useRoute();

  const handleSubmit = (e) => {
    e.preventDefault();
    formRef.value.validate(async (errors) => {
      if (!errors) {
        const { username, password, phone, code, loginType } = formInline;
        message.loading('登录中...');
        loading.value = true;

        const params: FormState = {
          username,
          password,
          phone,
          code,
          loginType,
        };

        try {
          const { code, message: msg } = await userStore.login(params);
          message.destroyAll();
          if (code == ResultEnum.SUCCESS) {
            const toPath = decodeURIComponent((route.query?.redirect || '/') as string);
            message.success('登录成功，即将进入系统');
            if (route.name === LOGIN_NAME) {
              router.replace('/');
            } else router.replace(toPath);
          } else {
            message.info(msg || '登录失败');
          }
        } finally {
          loading.value = false;
        }
      } else {
        message.error('请填写完整信息，并且进行验证码校验');
      }
    });
  };

  const handleGetVerificationCode = () => {
    // 如果正在倒计时，不执行任何操作
    if (countingDown.value) {
      return;
    }

    // 启动倒计时
    countdown.value = 60;
    countingDown.value = true;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        // 倒计时结束
        clearInterval(timer!);
        countingDown.value = false;
      }
    }, 1000);
    // 模拟发送验证码的操作，这里可以替换成实际的发送验证码的逻辑
    // 这里只是简单地输出一条信息
    message.success('验证码已发送，请注意查收');
  };
</script>

<style lang="less" scoped>
  .view-account {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: auto;

    &-container {
      flex: 1;
      padding: 32px 12px;
      max-width: 384px;
      min-width: 320px;
      margin: 0 auto;
    }

    &-top {
      padding: 32px 0;
      text-align: center;

      &-desc {
        font-size: 14px;
        color: #808695;
      }
    }

    &-other {
      width: 100%;
    }

    .default-color {
      color: #515a6e;

      .ant-checkbox-wrapper {
        color: #515a6e;
      }
    }
  }

  @media (min-width: 768px) {
    .view-account {
      background-image: url('../../assets/images/login.svg');
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: 100%;
    }

    .page-account-container {
      padding: 32px 0 24px 0;
    }
  }
</style>
