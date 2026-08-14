---
title: ROS 2 URDF 入门：从 Link、Joint 到机器人模型
date: 2026-08-14
categories:
  - ROS 2
tags:
  - ROS 2
  - URDF
  - 机器人
---

<!-- generated-by: kb-publish -->

当我们希望在 ROS 2 中显示、计算或仿真一个机器人时，首先需要用一种清晰的方式回答几个问题：机器人由哪些刚体组成？这些刚体如何连接？关节在哪里、能够怎样运动？各部分又具有怎样的外形和物理属性？

URDF（Unified Robot Description Format）就是用来表达这些信息的一种 XML 格式。它可以描述机器人的连杆结构、关节关系、几何外形以及质量和惯性等属性，供状态发布、可视化、仿真和运动学组件使用。

本文从两个最核心的元素 `link` 和 `joint` 开始，逐步建立一个基础的 URDF 机器人模型。

## 从 Link 和 Joint 理解机器人

URDF 中的机器人结构主要由两类元素构成：

- `link` 表示机器人中的刚体部分，例如底座、机械臂的一节连杆或末端部件。
- `joint` 连接两个 `link`，描述它们之间的相对位姿以及允许发生的运动。

可以把 `link` 想成骨骼，把 `joint` 想成连接骨骼的关节。不过在 URDF 中，这些关系不是随意连接的，而是组织成一棵树。

## Parent 和 Child 如何组成机器人树

每个 `joint` 都要指出它连接的父连杆和子连杆：

```xml
<joint name="shoulder_joint" type="revolute">
  <parent link="base_link"/>
  <child link="arm_link"/>
</joint>
```

这里，`base_link` 是父 `link`，`arm_link` 是子 `link`。从根 `link` 出发，多个这样的父子关系会逐层组成整台机器人的结构。

在基础 URDF 模型中：

- 根 `link` 没有父关节；
- 每个非根 `link` 通过一个 `joint` 连接到父 `link`；
- 模型应保持树状结构，不能形成环路，也不能让一个子 `link` 同时拥有多个父关节。

因此，写 URDF 时不应只关注单个关节是否正确，还要从整棵树的角度检查父子关系。

## Origin：关节在哪里、朝向哪里

`origin` 描述关节坐标系相对于父 `link` 坐标系的位姿：

```xml
<origin xyz="0 0 0.2" rpy="0 0 0"/>
```

其中：

- `xyz` 表示平移；
- `rpy` 表示滚转（roll）、俯仰（pitch）和偏航（yaw）。

上面的写法表示关节位于父坐标系上方 `0.2 m`，并且没有额外旋转。换句话说，`origin` 回答的是“关节安装在哪里，以及关节坐标系如何定向”。

## Axis：关节沿哪个方向运动

`axis` 描述关节的运动轴，方向表达在关节坐标系中：

```xml
<axis xyz="0 0 1"/>
```

这个例子表示运动轴沿关节坐标系的 Z 轴。对于旋转关节，它是旋转轴；对于平移关节，它是移动方向。

`origin` 和 `axis` 很容易混淆，但二者职责完全不同：

- `origin` 决定关节的位置和姿态；
- `axis` 决定关节运动的方向。

理解这一区别，是正确构建 URDF 坐标关系的关键。

## 常见 Joint 类型

### Revolute：有限角度旋转

`revolute` 表示关节绕 `axis` 旋转，并且具有有限的位置范围。它通常需要在 `limit` 中通过 `lower` 和 `upper` 指定角度上下限。

```xml
<joint name="shoulder_joint" type="revolute">
  <axis xyz="0 0 1"/>
  <limit lower="-1.57" upper="1.57" effort="20" velocity="1.0"/>
</joint>
```

### Continuous：连续旋转

`continuous` 同样表示绕 `axis` 旋转，但不设置角度上下限，可以连续转动。选择它的关键并不是“这个关节能否旋转”，而是它是否存在机械角度限位。

### Prismatic：沿轴平移

`prismatic` 是受限的移动关节。它沿 `axis` 指定的方向平移，其位置上下限使用米作为单位。与 `revolute` 一样，它通常也通过 `limit` 表达允许的运动范围和能力限制。

## Limit 和 Dynamics：范围、能力与运动特性

对于受限的可驱动关节，`limit` 用来描述运动约束：

```xml
<limit lower="-1.57" upper="1.57" effort="20" velocity="1.0"/>
```

- `lower`、`upper`：位置下限和上限。旋转关节使用弧度，移动关节使用米。
- `effort`：最大关节作用力；旋转关节通常对应力矩，移动关节通常对应力。
- `velocity`：最大关节速度。

不同工具对缺失字段的容忍程度可能不同。为了让约束清晰，并便于下游组件正确使用模型，应根据关节的真实物理能力填写这些参数，而不是依赖默认值。

`dynamics` 则描述运动相关的可选参数，例如：

```xml
<dynamics damping="0.1" friction="0.05"/>
```

- `damping` 表示阻尼；
- `friction` 表示摩擦。

这些参数主要影响动力学仿真或会读取它们的下游组件，并不负责定义关节的位置范围。

## Link 中的 Visual、Collision 和 Inertial

一个 `link` 不只是一个名字，它还可以分别描述外观、碰撞几何和惯性属性。

### Visual：看起来是什么样

`visual` 决定机器人在 RViz 或仿真器中的显示外观。它通常包含一个 `geometry`：

```xml
<visual>
  <geometry>
    <cylinder radius="0.05" length="0.4"/>
  </geometry>
</visual>
```

### Collision：碰撞检测使用什么形状

`collision` 为碰撞检测提供几何体。它和 `visual` 都可以使用 `geometry`，但用途不同。工程中常用简单几何体近似复杂的可视模型，以降低碰撞计算成本，因此二者可以相同，也可以不同。

```xml
<collision>
  <geometry>
    <cylinder radius="0.06" length="0.4"/>
  </geometry>
</collision>
```

### Inertial：它具有怎样的物理属性

`inertial` 描述质量、质心位置和转动惯量，供动力学仿真等组件使用。它回答的不是“物体长什么样”，而是“物体在受力时会怎样运动”。

因此，这三部分不能混为一谈：

| 元素 | 主要用途 |
| --- | --- |
| `visual` | 显示外观 |
| `collision` | 碰撞检测 |
| `inertial` | 质量、质心和转动惯量等物理描述 |

## Geometry、Mesh 和 package://

`visual` 与 `collision` 中常用的 `geometry` 类型包括：

- `box`
- `cylinder`
- `sphere`
- `mesh`

简单几何体适合快速搭建模型，也常用于碰撞近似。需要表达复杂外形时，可以使用 `mesh` 引用网格资源：

```xml
<mesh filename="package://open_manipulator_description/meshes/link1.stl"/>
```

这里的 `package://` 表示资源位于某个 ROS 2 package 中。资源能否成功加载，不只取决于 URI 是否拼写正确，还取决于对应 package 是否已经安装，并且能被 ROS 2 的 package 索引找到。

## 一个小型 URDF 示例

下面的模型包含一个底座、一节机械臂和一个旋转关节。除了拓扑关系，它还加入了基础的显示与碰撞几何：

```xml
<?xml version="1.0"?>
<robot name="simple_arm">
  <link name="base_link"/>

  <link name="arm_link">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.4"/>
      </geometry>
    </visual>

    <collision>
      <geometry>
        <cylinder radius="0.06" length="0.4"/>
      </geometry>
    </collision>
  </link>

  <joint name="shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="arm_link"/>
    <origin xyz="0 0 0.2" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="20" velocity="1.0"/>
    <dynamics damping="0.1" friction="0.05"/>
  </joint>
</robot>
```

这个模型表达了以下关系：

1. `base_link` 是模型的根连杆。
2. `arm_link` 通过 `shoulder_joint` 连接到 `base_link`。
3. 关节位于父坐标系上方 `0.2 m`。
4. 关节绕自身坐标系的 Z 轴旋转。
5. 旋转范围为 `-1.57` 到 `1.57` 弧度，并给出了作用力和速度限制。
6. 显示几何和碰撞几何分别承担可视化与碰撞检测职责。

这个示例没有填写 `inertial`。当模型需要用于动力学仿真时，还应根据实际部件补充质量、质心和转动惯量等物理属性。

## 常见理解误区

### 1. 把 Origin 当作运动轴

`origin` 描述关节坐标系相对于父坐标系的位姿；真正决定运动方向的是 `axis`。

### 2. 只要能旋转就使用 Continuous

如果关节存在机械角度限位，应使用具有有限范围的 `revolute`，而不是 `continuous`。

### 3. 颠倒 Parent 和 Child

父子关系一旦写反，影响的不只是一个关节，还可能改变整棵机器人树的结构。排查时应先确认拓扑，再检查坐标和运动参数。

### 4. 用高细节网格直接做碰撞模型

`visual` 与 `collision` 不必使用完全相同的几何体。复杂可视网格可以配合较简单的碰撞近似，以避免不必要的计算开销。

### 5. 把 Dynamics 当作位置限制

阻尼和摩擦描述运动特性，不定义关节可运动到哪里。位置范围应由 `limit` 表达。

### 6. 只检查 XML 语法，不检查物理关系

一个文件即使能被解析，其父子拓扑、`origin`、`axis`、限制参数或资源路径仍可能不符合预期。检查模型时可以按照以下顺序进行：

1. 检查 `parent` / `child` 拓扑；
2. 检查 `origin`；
3. 检查 `axis` 和 `limit`；
4. 根据用途分别检查 `visual`、`collision`、`inertial` 和 `dynamics`；
5. 使用网格时检查 `package://` 路径以及 package 是否可被找到。

## 下一步应该理解什么

掌握这一部分后，可以继续沿着三条主线深入：

- **坐标关系**：进一步理解每个 `link` 与 `joint` 的坐标系如何通过父子关系连接，以及坐标变换如何沿机器人树传播。
- **模型用途**：观察同一份模型中的 `visual`、`collision` 和 `inertial` 如何分别服务于显示、碰撞检测和动力学仿真。
- **工程验证**：把一个小型模型加载到对应工具中，从拓扑、位姿、运动轴、关节限制和资源加载几个层面逐项验证。

URDF 入门的重点，不是记住所有 XML 标签，而是建立一套稳定的理解框架：`link` 定义机器人由什么组成，`joint` 定义这些部分如何连接和运动，几何与物理属性则决定模型如何被显示、检测和仿真。只要这条主线清晰，后续扩展更复杂的机器人模型就会自然得多。

