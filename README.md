# 蓝箭项目管理平台

这是基于 `工程项目管理1.1` 继续整理的 `工程项目管理1.2` 版本。当前界面回到黑底电脑端后台形态，采用三栏布局：

- 左侧：13 个一级目录
- 中间：当前项目、当前标段、动态二级目录
- 右侧：指标卡、模块页签、当前模块内容区

## 当前项目

- 平台名称：蓝箭项目管理平台
- 当前项目：工程线位点二综合治理项目
- 当前标段：第一标段
- 项目标识：`assets/blue-arrow-logo.jpg`

## 第一个页面

首次打开平台时先进入项目建立页，字段保持简洁：

- 项目名称
- 项目管理者联系电话
- 手机验证码

原型阶段验证码为 `202620`。验证码通过后，页面才显示项目管理者代码和管理者密码；项目建立后，需要再次使用项目管理者代码和密码登录，才会进入三栏后台。

## GitHub 数据仓库

- 仓库：https://github.com/joker17-ai/engineering-project-management-platform
- Clone：https://github.com/joker17-ai/engineering-project-management-platform.git

数据目录：

- `data/projects`
- `data/documents`
- `data/progress`
- `data/public-notices`

## 本地预览

```powershell
py -m http.server 4174
```

打开：

```text
http://127.0.0.1:4174/
```

## 验证

```powershell
npm test
npm run build
node tests\verify-page.cjs
```
