# 电影镜头语言｜首轮知识准确性审校

审校日期：2026-11-10 · 分支：`feat/learning-lab-mvp`

## 审校原则
- 区分 **观察到的画面**、**摄影机/灯光的物理操作**、**常见叙事用途**，不把“典型情绪”写成必然结论。
- 区分 **二维画面演示** 与 **真实三维摄影机原理**。任何通过 SVG `viewBox` 或 CSS 变换实现的演示都不能被误称为具有准确视差/透视的真实摄影机移动。
- 中文俗称与英文电影术语不一定一一对应。术语分级是教学分类，不是硬性行业标准；不同机构可能使用不同命名。

## 本次已经修正
| 类型 | 位置 | 问题 | 修改 |
| --- | --- | --- | --- |
| 必改 | `js/data/frame.js` 三分法 | 错写“横竖各切三刀” | 改为横、竖各两条等分线 |
| 必改 | `js/data/angles.js` 荷兰角 | 错写“相机本身不歪” | 摄影机绕镜头光轴滚转（roll），不等于俯仰 |
| 必改 | `js/data/angles.js` POV | 将自身手部入镜当成判据 | 核心是角色视线与叙事视点 |
| 重要 | `js/data/edit.js` 跳剪 | 误当作简单改变取景框 | 说明相近构图中的时空/动作不连续 |
| 重要 | `js/data/angles.js` 俯拍/仰拍 | 人体比例变化被描述成必然 | 改为取决于距离、视线角度和焦距 |
| 重要 | `js/data/light.js` 逆光 | 断言必然出现剪影 | 明确受正面补光与曝光影响 |
| 重要 | `js/data/light.js` 高调/低调 | 只以整体亮暗区分 | 强调照明反差、阴影组织与曝光 |
| 重要 | `js/data/angles.js` OTS vs POV | 混淆是否出现人体局部 | 区分前景肩部的构图方式与角色视点 |

## 后续需要继续审校（不应在 MVP 阶段一次性大改）
1. **知识体系正交化**：`OTS / POV` 是构图、视点、镜头关系，不是简单的相机俯仰角；下一版可添加标签 `机位高度`、`滚转`、`视点`、`人物关系`，不强制改变现有 46 条菜单位置。
2. **景别命名弹性**：`Close Shot`、`Close-Up`、`Full Shot` 以及“近景/特写”在不同教材中的边界并不完全一致；应避免用面部覆盖率硬性判定。
3. **推/拉/移/环绕动画**：当前 SVG `viewBox` 取景变化无法呈现三维相机运动视差；原有演示暂保留，但应在卡片注明“二维示意”，在实验室中体验真实三维变化。
4. **灯光模式**：侧光、轮廓光、高低调属于不同层面的描述（光源方位、轮廓效果、照明风格）；当前分区属于教学便利性分类，应明确边界。
5. **情绪描述**：6 类术语的用途与情绪文字仍需逐项排查“必然”与“总是”表述，并加入反例。
6. **用片段验证**：未来可添加合法授权或自制的视频示例，与抽象几何示意并列，不应仅靠动画断言电影效果。

## 交互实验室的科学边界
- **推轨 Dolly vs 光学变焦 Zoom**：机位改变会改变物体投影的视差、遮挡与相对大小；固定机位的理想透视投影，仅改变焦距不改变物体之间的几何透视关系。
- **俯拍 vs 仰拍**：用真实三维相机位置与方向演示（对准固定人物上身），不是用整张平面画旋转假装改变机位。
- **焦距 vs 透视**：机位固定只改变视角。要获得相近主体构图而移动机位，透视差异来自机位变化。
- 本 MVP 不模拟真实镜头畸变、对焦、景深、运动模糊或真实影视光照。人物与建筑为几何代理模型。

## 外部参考
- [B&H Explora | Filmmaking 101: Camera Shot Types](https://www.bhphotovideo.com/explora/video/tips-and-solutions/filmmaking-101-camera-shot-types)
- [Columbia University | Canted Angle (Dutch Angle)](https://filmglossary.ccnmtl.columbia.edu/term/canted-angle-dutch-angle/)
- [Oxford University Press | Glossary of Film Terminology](https://oxford.co.za/download_files/schools/7_16_A_glossary_of_film_terminology.pdf)
- [Camera Focal Length and the Perception of Pictures](https://pmc.ncbi.nlm.nih.gov/articles/PMC4114730/)
