---
title: "ROS 2 工作空间、仓库与软件包边界"
date: 2026-08-18
categories:
  - "ROS 2"
tags:
  - "知识库"
  - "ROS 2"
knowledge: true
---

<!-- generated-by: kb-publish -->

<!-- generated-by: kb-sync-public -->

ROS 2 工程中，workspace、Git repository 和 package 是三个不同层级。区分它们，是理解大型机器人项目目录、构建流程和模块职责的基础。

```text
workspace/
├── src/
│   └── repository/              Git 仓库边界（可包含多个 package）
│       ├── robot_description/   ROS 2 package
│       ├── robot_bringup/       ROS 2 package
│       └── robot_moveit_config/ ROS 2 package
├── build/                       构建中间产物
├── install/                     安装后可使用的产物
└── log/                         构建日志
```

## 三个边界

- workspace：统一构建和使用一组 ROS 2 package 的环境；`src/` 中可以放多个仓库。
- repository：Git 跟踪和协作的边界，由 `.git/` 标识；一个仓库可以维护多个相关 package。
- package：ROS 2 的依赖、构建、安装和运行组织单元，通常由 `package.xml` 声明身份与依赖。

一个仓库包含多个相关 package 是常见设计，不代表这些 package 必须一起启动或承担同一职责。

## 常见包职责

机器人项目常按变化原因和运行职责拆分：

- `*_description`：URDF/Xacro、mesh、RViz 配置等模型资源。
- `*_bringup`：组合驱动、状态发布器、控制器和参数，负责系统启动。
- `*_moveit_config`：规划组、运动学、碰撞矩阵、规划器和控制器接口等 MoveIt 配置。
- `*_hardware` / `*_controllers`：硬件接口和控制器实现或配置。
- GUI、teleop、perception、application：按独立能力继续拆分。

一种常见的机械臂仓库结构是把 `description`、`interfaces`、C++/Python 控制实现、视觉、MoveIt 配置和 `bringup` 分开。语言不是首要拆包依据；更重要的是接口、依赖和生命周期。URDF、YAML、RViz 与 MoveIt 配置通常只维护一套；只有确有教学、原型验证或性能比较价值的节点，才值得提供 C++ 与 Python 对照实现，避免把整个系统机械复制两遍。

拆包的目标是降低耦合并允许替换：只做仿真时仍可复用 description 和规划配置；更换 GUI 或控制器时不必改动机器人模型。不要只为了目录整齐而拆包，边界应对应独立职责、依赖或生命周期。

### 接口包与实现包

自定义 `msg`、`srv`、`action` 可以集中在独立接口包中，业务节点包只声明并使用这些接口。接口包规定“交换什么数据”，实现包负责“收到数据后做什么”或“何时发布数据”。这种分离允许 C++、Python 等不同实现共享同一份通信契约，也避免接口定义跟随某个节点的实现细节变化。

```text
robot_interfaces       定义 msg / srv / action
       ↑       ↑
       │依赖   │依赖
cpp_nodes   python_nodes    实现通信与业务逻辑
```

接口包采用 `ament_cmake` 不等于接口只能被 C++ 使用，也不等于包内必须有可执行节点。反过来，节点通常运行的是包中安装好的可执行程序或 Python 入口，而不是“运行整个 package”。一个 package 可以包含多个节点或资源；源文件、可执行程序和运行时 Node 也没有强制的一一对应关系。

## `package.xml` 与构建文件

`package.xml` 主要声明：

- 包名、版本、维护者、许可证等元数据；
- 构建、运行和测试依赖；
- 构建类型，例如 `ament_cmake`。

对于 `ament_cmake` package，`CMakeLists.txt` 负责真正的构建和安装规则。两者不是重复关系：前者声明“我是谁、依赖谁”，后者实现“怎样构建和安装”。`ament_cmake` 也不意味着包内一定有 C++；纯资源 description package 同样可以使用它。

依赖需要在正确层次表达：`package.xml` 声明包级构建/运行契约，`find_package()` 让 CMake 找到依赖，目标依赖或链接规则把依赖关联到具体可执行目标，C++ 的 `#include` 则让单个翻译单元看见所用声明。某个原生消息示例若只使用 `rclcpp` 和 `std_msgs`，就不应仅因后续会用自定义接口而强制查找一个当前未使用的接口包；多余的 `REQUIRED` 依赖也会制造不必要的构建失败点。

## 从源码到可发现资源

`colcon build` 是对工作空间中多个 package 的统一构建编排。这里的 build 不一定是编译：资源包可能只执行安装规则。

例如：

```cmake
install(
  DIRECTORY launch urdf meshes rviz
  DESTINATION share/${PROJECT_NAME}
)
```

它把源码资源安装到 package 的 share 目录。运行时应通过 package 索引和 share 路径查找资源，而不是硬编码某台机器的 `src/` 绝对路径。若源码中存在 mesh 或 launch 文件、安装树中却没有，应优先检查 `install()` 规则和是否重新构建。

典型链路是：

```text
package.xml + CMakeLists.txt
            ↓
       colcon build
            ↓
     build/ + install/
            ↓
 source install/setup.bash
            ↓
当前 shell 能发现该工作空间中的 package 和资源
```

资源包还应在 `package.xml` 中声明运行时真正使用的工具，例如 Xacro、状态发布器或 Launch 依赖。`CMakeLists.txt` 的安装规则解决“文件是否进入安装空间”，`package.xml` 的依赖声明解决“运行环境需要具备什么”；两者缺一不可。

`source install/setup.bash` 不会编译或启动程序；它只是把安装空间叠加到当前 shell 环境。新终端需要重新加载，除非已通过 shell 配置显式处理。

选择单个包时，`colcon build --packages-select <包名>` 不会自动选中工作空间内尚未构建的依赖包。若目标包依赖同一工作空间中的其他包，可使用：

```bash
colcon build --packages-up-to <目标包>
```

它会选择目标包及其递归依赖。若错误指向 `install/<依赖包>/share/<依赖包>/package.sh` 不存在，应先用 `colcon list` 确认依赖源码是否可发现，再判断是构建选择范围不足，还是 `package.xml` / `CMakeLists.txt` 声明了不存在或不需要的依赖。

对于 C++ 可执行程序，源码编译成功还不等于 `ros2 run` 可以发现它。`CMakeLists.txt` 至少需要用 `add_executable()` 创建目标，并通过：

```cmake
install(
  TARGETS <目标名>
  DESTINATION lib/${PROJECT_NAME}
)
```

将目标安装到约定位置。`ros2 pkg executables <包名>` 可用于检查安装索引中实际登记的可执行程序。

## 排查顺序

遇到 package、可执行程序或资源“找不到”时，可按边界排查：

1. `colcon list` 是否能从源码识别 package。
2. `package.xml` 的名称、依赖和 build type 是否正确。
3. `CMakeLists.txt` 是否创建并安装了目标或资源。
4. 最近修改后是否重新构建。
5. 当前 shell 是否 source 了正确的安装空间。
6. 安装树中是否实际存在目标文件。

这能区分源码发现、依赖声明、构建、安装和环境加载问题，避免把所有“找不到”都归咎于 ROS 2 本身。

## 相关知识

- Git 克隆与源码快照
- URDF 机器人模型基础
- rclcpp 话题发布者与执行器
