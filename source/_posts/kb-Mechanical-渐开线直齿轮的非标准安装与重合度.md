---
title: "渐开线直齿轮的非标准安装与重合度"
date: 2026-08-18
categories:
  - "机械原理"
tags:
  - "知识库"
  - "机械原理"
knowledge: true
---

<!-- generated-by: kb-publish -->

<!-- generated-by: kb-sync-public -->

一对渐开线标准直齿圆柱齿轮改变安装中心距后，齿轮本身的分度圆、基圆和齿顶圆不变，但工作节圆和实际啮合角会改变。分析时必须区分标准压力角、实际啮合角和齿顶圆压力角。

## 1. 不随安装改变的几何量

对模数为 \(m\)、齿数为 \(z\)、标准压力角为 \(\alpha\) 的标准齿轮：

\[
r=\frac{mz}{2},\qquad r_b=r\cos\alpha
\]

标准齿顶高为

\[
h_a=h_a^*m
\]

其中 \(h_a^*\) 是齿顶高系数；标准正常齿制通常取 \(h_a^*=1\)。于是

\[
r_a=r+h_a^*m
\]

这些尺寸由齿轮制造参数决定，不会因为安装中心距变化而改变。

## 2. 实际啮合角

标准中心距为

\[
a=r_1+r_2=\frac{m(z_1+z_2)}{2}
\]

安装中心距变为 \(a'\) 后，因为两个基圆不变：

\[
\boxed{a\cos\alpha=a'\cos\alpha'}
\]

所以实际啮合角为

\[
\boxed{\alpha'=\arccos\left(\frac{a}{a'}\cos\alpha\right)}
\]

当 \(a'>a\) 时，\(\alpha'>\alpha\)。此时分度圆仍由 \(m,z\) 决定，而工作节圆随实际中心距改变，二者不再重合。

## 3. 三类压力角不要混用

- \(\alpha\)：标准压力角，用于定义基圆和基节；
- \(\alpha'\)：实际啮合角，由安装中心距决定；
- \(\alpha_{a1},\alpha_{a2}\)：两轮齿顶圆压力角，分别满足

\[
\cos\alpha_{ai}=\frac{r_{bi}}{r_{ai}}
\]

齿顶圆压力角不是实际啮合角，计算重合度时不能互相替代。

## 4. 端面重合度的两种等价形式

端面重合度等于实际啮合线长度与基节之比。基节为

\[
p_b=\pi m\cos\alpha
\]

因此可写为

\[
\boxed{
\varepsilon_\alpha=
\frac{
\sqrt{r_{a1}^2-r_{b1}^2}
+\sqrt{r_{a2}^2-r_{b2}^2}
-a'\sin\alpha'
}{\pi m\cos\alpha}
}
\]

利用 \(\sqrt{r_a^2-r_b^2}=r_b\tan\alpha_a\)、\(r_b=(mz/2)\cos\alpha\) 以及 \(a'\sin\alpha'=(m/2)(z_1+z_2)\cos\alpha\tan\alpha'\)，可化为齿数—压力角形式：

\[
\boxed{
\varepsilon_\alpha=
\frac{1}{2\pi}
\left[
z_1(\tan\alpha_{a1}-\tan\alpha')
+z_2(\tan\alpha_{a2}-\tan\alpha')
\right]
}
\]

两式理论上等价。使用哪一种取决于已知量；结果不一致时，应检查角度单位、舍入精度和中间算术，而不是先假定公式不同。

## 5. 工程与计算检查

- 先列出 \(r_i,r_{bi},r_{ai},a',\alpha',\alpha_{ai}\)，再代入重合度公式，避免混角。
- 三角函数计算应统一使用角度制或弧度制；程序库通常默认弧度制。
- 中间量保留足够精度，最后再舍入。
- 用两种等价公式交叉检查，可发现漏项、符号或数值错误。
- 连续传动通常要求端面重合度 \(\varepsilon_\alpha\ge 1\)；设计判断还需结合具体齿制、强度、干涉和制造安装条件。

## 相关知识

- 轮系分类与传动比分析
