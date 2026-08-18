---
title: "编程范式与命名约定"
date: 2026-08-18
categories:
  - "C++"
tags:
  - "知识库"
  - "C++"
knowledge: true
---

<!-- generated-by: kb-publish -->

<!-- generated-by: kb-sync-public -->

## C++ 和 Python 都是多范式语言

C++ 和 Python 都能使用面向过程、面向对象等编程方式，不能简单地把 Python 归为面向对象、把 C++ 归为面向过程。

- 面向过程以函数和执行步骤组织程序，关注“先做什么、再做什么”。
- 面向对象把数据和操作数据的行为封装在对象中，常用类、对象、构造函数、继承和多态表达模型。
- C 主要采用面向过程风格；C++ 在兼容大量 C 风格写法的同时原生支持面向对象、泛型等范式。

在 ROS 2 中，C++ 节点经常继承 `rclcpp::Node`，Python 节点经常继承 `Node`。因此学习 ROS 2 时需要掌握类与对象、构造函数、继承、成员变量、成员函数、访问控制、回调，以及 C++ 的指针与智能指针。

## 常见命名方式

| 方式 | 示例 | 常见用途 |
|---|---|---|
| 小驼峰 `lowerCamelCase` | `targetPosition` | 部分项目中的变量、函数 |
| 大驼峰 `UpperCamelCase` / `PascalCase` | `RobotController` | 类、结构体、自定义类型 |
| 蛇形 `snake_case` | `target_position` | Python 函数和变量、ROS 2 名称、部分 C++ 项目 |

语言通常不强制一种唯一风格，项目内一致性比选择哪一种风格更重要。开始学习 ROS 2 时，可以采用以下约定：

- 类名：大驼峰，如 `MotorController`。
- C++/Python 函数和局部变量：蛇形，如 `update_speed`、`target_speed`。
- C++ 成员变量：末尾加下划线，如 `target_speed_`。
- ROS 2 节点名和话题名：小写蛇形，如 `minimal_publisher`、`cmd_vel`。

具体工程应以该项目已有的格式规范为准。

## Python 类定义中的常见错误

```python
class PersonNode:
    def __init__(self, name_value: str, age_value: int):
        self.name = name_value
        self.age = age_value


def main():
    node = PersonNode('张三', 18)
    print(node.name, node.age)


if __name__ == '__main__':
    main()
```

检查重点：

- 代码标点必须使用英文符号；中文逗号会导致 `SyntaxError`。
- 定义类与实例化类时名称必须一致，否则会出现 `NameError`。
- 只定义 `main()` 不会自动执行，需要显式调用；脚本通常使用 `if __name__ == '__main__':` 作为入口。
