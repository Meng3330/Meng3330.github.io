---
title: "rclcpp 话题发布者与执行器"
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

ROS 2 的 C++ 话题发布节点通常把节点、发布者、定时器和状态封装在一个继承 `rclcpp::Node` 的类中，再由执行器调度回调。核心不是手写无限循环，而是注册通信对象和回调，让 `spin()` 持续处理就绪事件。

## 最小发布链路

```cpp
#include <chrono>
#include <functional>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using namespace std::chrono_literals;

class MinimalPublisher : public rclcpp::Node
{
public:
  MinimalPublisher()
  : Node("minimal_publisher"), count_(0)
  {
    publisher_ = create_publisher<std_msgs::msg::String>("topic", 10);
    timer_ = create_wall_timer(
      500ms,
      std::bind(&MinimalPublisher::timer_callback, this));
  }

private:
  void timer_callback()
  {
    std_msgs::msg::String message;
    message.data = "Hello, world! " + std::to_string(count_++);
    RCLCPP_INFO(get_logger(), "Publishing: '%s'", message.data.c_str());
    publisher_->publish(message);
  }

  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
  std::size_t count_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  auto node = std::make_shared<MinimalPublisher>();
  rclcpp::spin(node);
  rclcpp::shutdown();
  return 0;
}
```

运行链路是：初始化 ROS 2，构造节点并创建发布者和定时器，`spin()` 等待事件，定时器就绪后由执行器调用回调，回调构造并发布消息。500 ms 的周期对应约 2 Hz；它是触发周期，不保证回调在任何负载下都绝对准时。

## 各对象的职责

- `rclcpp::Node`：节点基础设施；构造函数参数是 ROS 2 节点名，不是 C++ 类名或话题名。
- `Publisher<MessageT>`：只能发布声明的消息类型。订阅端还需满足话题名、类型和 QoS 兼容，才能匹配。
- `std_msgs::msg::String`：ROS 2 消息对象，负载在 `data` 字段中；它不是裸 `std::string`。
- `TimerBase`：按周期产生待执行事件；没有执行器持续 spin，回调不会被正常调度。
- `count_`：跨多次回调保存状态；`count_++` 先使用旧值再递增。

`create_publisher<...>("topic", 10)` 中的 `10` 是 QoS history depth 的简写参数，不是发布次数、订阅者数量或时间间隔。其具体丢弃行为还取决于完整 QoS 策略和通信状态，不应只凭这个数字推断所有传输行为。

## 订阅与回调链路

订阅者同样在构造阶段注册通信实体和回调，在 `spin()` 期间由执行器把到达的消息交给回调：

```cpp
using std::placeholders::_1;

class MinimalSubscriber : public rclcpp::Node
{
public:
  MinimalSubscriber()
  : Node("minimal_subscriber")
  {
    subscription_ = create_subscription<std_msgs::msg::String>(
      "topic", 10,
      std::bind(&MinimalSubscriber::topic_callback, this, _1));
  }

private:
  void topic_callback(const std_msgs::msg::String & msg) const
  {
    RCLCPP_INFO(get_logger(), "Received: '%s'", msg.data.c_str());
  }

  rclcpp::Subscription<std_msgs::msg::String>::SharedPtr subscription_;
};
```

`_1` 是将来调用回调时的第一个实参占位符，这里对应收到的消息。`const MessageT &` 以只读引用访问消息，避免一次不必要的值复制；函数末尾的 `const` 则承诺该成员函数不修改节点对象的普通成员状态，两处 `const` 修饰的对象不同。

发布端与订阅端至少要在话题名、消息类型和 QoS 兼容性上匹配。相同话题名和类型是必要条件，但不能据此忽略 QoS。完整事件链是：

```text
Timer 或其他业务事件
        ↓
publisher_->publish(message)
        ↓
       Topic
        ↓
Subscription 就绪
        ↓
Executor 调用 topic_callback(msg)
```

消息有哪些字段由接口定义决定，而不是由 `auto` 产生。例如 `std_msgs::msg::String` 定义了 `data`，所以对应对象具有 `message.data`；自定义消息的成员则来自其 `.msg` 字段。

## 回调绑定与生命周期

非静态成员函数必须绑定到具体对象：

```cpp
std::bind(&MinimalPublisher::timer_callback, this)
```

可近似改写为：

```cpp
[this]() { timer_callback(); }
```

发布者和定时器要保存为节点成员。若只保存在构造函数的局部变量中，构造结束后其共享所有权可能消失，对象被销毁，后续便无法按预期通信或触发。消息本身可以是回调内的局部变量，每次回调重新构造。

Subscription 同样应由节点成员持有。通信对象负责把事件注册进系统，executor 负责等待并调度就绪回调：定时器只规定何时就绪，订阅器只描述收到消息后调用谁；没有持续运行的 executor，这些回调不会自行循环执行。

节点类适合承担 ROS 通信、参数、日志和调度适配，纯算法类不必继承 `rclcpp::Node`。把通信层与算法层分开后，算法可以不启动 ROS 2 就进行单元测试，也能减少节点类中通信代码与数学/控制实现的耦合。

## 日志与标准库边界

`RCLCPP_INFO` 的格式参数沿用 printf 风格；`%s` 需要 `const char *`，因此 `std::string` 通常通过 `c_str()` 传入。日志输出只是可观测性手段，真正发送消息的是 `publisher_->publish(message)`。

代码应显式包含直接使用的标准库头文件，如 `<chrono>`、`<functional>`、`<memory>` 和 `<string>`，不要依赖 ROS 2 头文件的间接包含。

## 构建和运行

C++ 节点能被 `ros2 run` 找到，需要在 `CMakeLists.txt` 中形成完整链路：

```cmake
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

add_executable(demo01_talker_str src/demo01_talker_str.cpp)
ament_target_dependencies(demo01_talker_str rclcpp std_msgs)

install(
  TARGETS demo01_talker_str
  DESTINATION lib/${PROJECT_NAME}
)
```

`add_executable()` 负责生成目标，`ament_target_dependencies()` 关联依赖，`install(TARGETS ...)` 把目标放进 ROS 2 约定的安装位置。构建后 source 正确的安装空间，才能按包名和可执行文件名运行。完整的工作空间发现与排错链路见 ROS 2 工作空间、仓库与软件包边界。

## 常见检查点

- `colcon` 子命令是 `build`，选择单包的选项是 `--packages-select`。
- 工作空间内有尚未构建的依赖包时，可用 `colcon build --packages-up-to <目标包>` 构建目标及其递归依赖。
- `No executable found` 表明包可能已被发现，但请求的可执行文件未出现在该包的安装结果中；检查目标名、`add_executable()`、`install(TARGETS ...)`、重新构建和环境加载。
- `source install/setup.bash` 与 `. install/setup.bash` 等价，当前 shell 执行一次即可。
- `Unknown CMake command` 应先检查命令由哪个 CMake package 提供、相应 `find_package()` 是否确实生效，再核对当前发行版的官方构建接口；不能仅凭错误文本断定是缺少某一行或发行版迁移。
- 大量模板与 callback 类型错误常是首个拼写或签名错误的连锁结果。优先修复日志中的第一处源码错误，例如消息命名空间、成员名、逗号、`auto`、`const` 和回调签名，再重新构建，不要逐条追逐后续模板展开信息。
- 验证发布订阅链路时，应同时观察发布日志、订阅日志及消息序号/内容是否对应；这能证明构建、节点启动、话题匹配和回调执行已贯通，但不等于证明所有 QoS 或高负载条件都正确。

## 相关知识

- ROS 2 工作空间、仓库与软件包边界
- 编程范式与命名约定
