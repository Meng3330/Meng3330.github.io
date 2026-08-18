---
title: "Linux 终端中的文件查看、编辑与打开"
date: 2026-08-18
categories:
  - "Linux"
tags:
  - "知识库"
  - "Linux"
knowledge: true
---

<!-- generated-by: kb-publish -->

<!-- generated-by: kb-sync-public -->

在终端中“打开文件”可能指查看内容、编辑内容，或把文件交给图形界面程序。应先区分目的，再选择命令。

## 查看文本内容

`cat` 会把文件内容一次性输出到终端，适合较短的文本文件：

```bash
cat package.xml
```

较长文件更适合用 `less` 分页查看：

```bash
less package.xml
```

可以滚动和搜索，按 `q` 退出。与 `cat` 相比，`less` 不会让大量内容一次刷过终端。

## 在终端中编辑

可使用终端文本编辑器，例如 Nano：

```bash
nano package.xml
```

Nano 中常用操作：

- `Ctrl+O`：写入文件，再按回车确认文件名；
- `Ctrl+X`：退出。

编辑前应确认当前目录和目标路径，避免修改同名但位置不同的文件。

## 使用系统默认应用打开

在采用 Freedesktop 桌面规范的 Linux 桌面环境中，可用 `xdg-open` 将文件交给其默认关联应用：

```bash
xdg-open report.pdf
xdg-open image.png
```

它通常会启动图形界面程序，并不在终端内显示文件内容。该命令依赖图形桌面会话和文件类型关联，在纯终端或无图形界面的远程环境中可能无法使用。

## 使用 VS Code 打开

安装并配置 VS Code 的命令行启动器后，可以打开单个文件：

```bash
code package.xml
```

也可以把当前目录作为一个工作区打开：

```bash
code .
```

这里的 `.` 表示当前工作目录，因此运行前应先用 `pwd` 确认位置，必要时用 `cd` 进入项目目录。

如果终端提示 `code: command not found`，说明 shell 当前找不到 `code` 可执行文件。常见原因是 VS Code 未安装、命令行启动器未加入 `PATH`，或安装方式没有提供该命令；应先检查安装方式和 `PATH`，而不是把它当作文件路径错误。

## 路径与文件名

相对路径以当前工作目录为基准；目标不在当前目录时，可使用相对路径或绝对路径：

```bash
less docs/notes.md
code /path/to/project/package.xml
```

文件名包含空格或其他可能被 shell 解释的字符时，应引用路径：

```bash
xdg-open "my file.txt"
code "my file.txt"
```

## 选择原则

| 目的 | 常用命令 |
| --- | --- |
| 快速输出短文本 | `cat file` |
| 分页阅读长文本 | `less file` |
| 在终端内编辑 | `nano file` |
| 用系统默认图形程序打开 | `xdg-open file` |
| 用 VS Code 打开文件 | `code file` |
| 用 VS Code 打开当前目录 | `code .` |

这些命令的差别不在于“都能打开”，而在于它们分别执行输出、分页阅读、编辑或启动外部应用。
