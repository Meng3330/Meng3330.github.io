---
title: "URDF 机器人模型基础"
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

URDF（Unified Robot Description Format）是一种用 XML 描述机器人模型的格式。在 ROS 2 中，它常用于表达机器人的连杆结构、关节关系以及相关的几何和物理属性，供状态发布、可视化、仿真和运动学组件使用。

Xacro 是生成 URDF 的 XML 宏工具。工程中通常维护 `.urdf.xacro` 源文件，由 `xacro` 展开为普通 URDF XML，再交给下游组件；应修改 Xacro 源文件，而不是编辑自动生成的 URDF。

## 基本结构

机器人的运动学结构主要由 `link` 和 `joint` 组成：

- `link` 表示机器人中的刚体部分。
- `joint` 连接两个 `link`，并描述它们之间的相对位姿和允许运动。

多个 `link` 通过 `joint` 连接后形成一棵以根 `link` 为起点的树。每个非根 `link` 由一个 `joint` 连接到它的父 `link`。

## Link 的几何与物理描述

一个 `link` 可以分别描述外观、碰撞几何和惯性属性：

- `visual`：决定 RViz 或仿真器中显示的外观。
- `collision`：提供碰撞检测使用的几何体。
- `inertial`：描述质量、质心位置和转动惯量，供动力学仿真等组件使用。

`visual` 和 `collision` 都可以包含 `geometry`，但不能因为几何表达形式相同就混淆二者的用途。为了降低碰撞计算成本，工程中常用简单几何体近似复杂的可视模型；因此二者可以相同，也可以不同。

常用的 `geometry` 类型包括：

- `box`
- `cylinder`
- `sphere`
- `mesh`

`mesh` 可使用 `package://` URI 引用 ROS 2 package 中的模型资源，例如：

```xml
<mesh filename="package://open_manipulator_description/meshes/link1.stl"/>
```

资源能否正确加载，不只取决于 URI 写法，还取决于对应 package 是否已安装并能被 ROS 2 的 package 索引找到。

网格文件的单位不一定与 URDF 的米一致。例如以毫米导出的 STL 常需要 `scale="0.001 0.001 0.001"`。缩放值应依据资源的实际导出单位或项目文档确定，不能把 `0.001` 当作所有 STL 的固定写法。

## Joint 中的核心关系

一个 `joint` 通常需要说明：

- `parent`：父 `link`。
- `child`：子 `link`。
- `origin`：关节坐标系相对于父 `link` 坐标系的位姿；通常用 `xyz` 表示平移，用 `rpy` 表示滚转、俯仰和偏航。
- `axis`：关节运动轴，表达在关节坐标系中；主要用于旋转或平移关节。

这意味着 `origin` 决定“关节位于哪里、朝向如何”，而 `axis` 决定“关节沿哪个方向运动”。两者承担不同职责。

还要区分不同层级的 `origin`：

- `joint/origin`：关节坐标系相对父 `link` 坐标系的位姿。
- `visual/origin`：可视几何相对当前 `link` 坐标系的位姿。
- `collision/origin`：碰撞几何相对当前 `link` 坐标系的位姿。
- `inertial/origin`：质心和惯性参考系相对当前 `link` 坐标系的位姿。

因此，改变 `visual/origin` 只是在 link 坐标系下移动外观，不能替代关节的运动学变换。`axis` 表达在关节坐标系中；如果 `joint/origin` 含旋转，不能只按父坐标系的直觉判断运动方向。

## Revolute 与 Continuous

`revolute` 和 `continuous` 都表示绕轴旋转，但约束不同：

| 类型 | 运动方式 | 位置范围 |
| --- | --- | --- |
| `revolute` | 绕 `axis` 旋转 | 有限角度范围，通过 `limit` 的 `lower` 与 `upper` 描述 |
| `continuous` | 绕 `axis` 旋转 | 不设置角度上下限，可连续旋转 |

对可驱动关节，还需要根据模型用途正确提供速度、力矩等限制。不要仅根据“能够旋转”来选择类型；是否存在机械角度限位才是区分二者的关键。

## Joint 的运动限制与动力学参数

`revolute` 和 `prismatic` 关节通常通过 `limit` 描述允许运动：

- `lower`、`upper`：位置下限和上限；旋转关节使用弧度，移动关节使用米。
- `effort`：允许的最大关节作用力；旋转关节通常表示力矩，移动关节通常表示力。
- `velocity`：允许的最大关节速度。

不同工具对缺失字段的容忍程度可能不同。为了让模型约束明确且便于下游组件使用，应为受限的可驱动关节完整填写与其物理能力一致的限制，而不是依赖工具默认值。

关节还可以使用可选的 `dynamics` 描述运动相关参数，例如 `damping`（阻尼）和 `friction`（摩擦）。这些参数主要影响动力学仿真或使用它们的下游组件，不负责定义关节的运动范围。

## 最小示例

```xml
<robot name="simple_arm">
  <link name="base_link"/>
  <link name="arm_link"/>

  <joint name="shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="arm_link"/>
    <origin xyz="0 0 0.2" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="20" velocity="1.0"/>
  </joint>
</robot>
```

这个模型表达：`arm_link` 通过 `shoulder_joint` 连接到 `base_link`，关节位于父坐标系上方 `0.2 m`，并绕关节坐标系的 Z 轴在有限范围内旋转。

## 从模型文件到 RViz 的运行链

机器人模型显示和可动关节状态通常经过：

```text
.urdf.xacro
      ↓ xacro
URDF XML（robot_description）
      ↓
robot_state_publisher ← /joint_states
      ↓
 /tf 与 /tf_static
      ↓
RViz RobotModel
```

- `robot_description` 表示展开后的整份机器人描述内容，不是模型文件路径。
- `robot_state_publisher` 结合模型拓扑和当前关节状态计算各 link 的 TF；固定关节可直接发布静态关系。
- `/joint_states` 表示可动关节“当前在哪里”，URDF 的 `type`、`axis` 和 `limit` 则表示关节“允许怎样运动”。教学和模型验证阶段可用 `joint_state_publisher_gui` 手动产生关节状态；真机中通常由驱动或控制系统提供。
- RViz 是可视化工具，不是物理仿真器；它需要正确的模型描述、TF 和 Fixed Frame 才能显示预期结果。

RViz 与物理仿真器的职责应明确分开：RViz 负责观察模型、TF、传感器数据和规划结果，本身不模拟重力、摩擦、碰撞响应、执行器力矩或真实抓取；Gazebo 等仿真器才负责这些物理过程。模型在 RViz 中显示正确，只能证明描述和坐标数据基本可用，不能证明动力学或控制方案可行。

有些模型会增加一个无几何属性的虚拟 `world` link，并通过 fixed joint 连接机器人根 link。这为整机提供稳定的外部参考坐标系，但它不是必须代表真实零件。

在 Python Launch 中，常见做法是通过 package 的 share 目录定位 Xacro，运行 Xacro 得到 `robot_description`，再把它作为参数传给 `robot_state_publisher`。应使用 package 资源查找机制，避免硬编码本地绝对路径。相关安装链参见 ROS 2 工作空间、仓库与软件包边界。

## 常见错误

- 颠倒 `parent` 和 `child`，导致整棵模型树的关系错误。
- 把 `origin` 当成运动轴方向，或把 `axis` 当成关节位姿。
- 为存在机械限位的关节使用 `continuous`。
- `revolute` 关节遗漏必要的限制参数。
- 把高细节可视网格直接当作碰撞模型，导致碰撞计算开销不必要地增大。
- 使用 `mesh` 时 URI 指向不存在或未被索引的 package，导致资源加载失败。
- 把 `dynamics` 中的阻尼参数误当作位置或速度限制。
- 模型出现环路或一个子 `link` 拥有多个父关节；基础 URDF 的运动学结构应保持为树。
- 把自闭合的 `<link .../>` 后面继续添加 `visual` 等子元素，造成 XML 结构错误。
- 拼错 Xacro 命令、package 名或资源路径后，未先区分“命令不存在”和“模型语法错误”。
- 修改了 `src/` 中的模型或资源，却未重新构建/安装，导致 Launch 仍读取旧的 `install/` 内容。

## 工程检查思路

排查模型时，先检查父子拓扑，再检查 `origin`，然后检查 `axis` 和 `limit`；涉及显示、碰撞或仿真时，再分别核对 `visual`、`collision`、`inertial` 和 `dynamics`。资源模型还要核对 package URI、mesh 单位和安装树。

推荐采用“小步闭环”：每增加一个 link、joint 或资源引用，先运行 Xacro 验证 XML/宏展开，再构建并检查安装树，最后启动状态发布与 RViz。这样可以把语法、资源安装、TF 和可视化问题分层定位。

更完整的显示验收应分别确认：Xacro 可展开、安装空间包含资源、`robot_description` 有内容、`/joint_states` 与 TF 正常、RViz 的 Fixed Frame 存在，并且 RobotModel 的 Description Topic 指向正确的机器人描述。插件显示 `Status: Ok` 并不总能代替对实际订阅配置和模型内容的检查。
